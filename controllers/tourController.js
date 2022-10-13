//const fs = require ('fs')
const Tour = require('./../models/tourModel')
const APIFeatures = require('./../utils/apiFeatures')
// const express = require('express')
const catchAsync = require ('./../utils/catchAsync');
const AppError = require ('./../utils/appError');

exports.aliasTopTours = (req, res, next) =>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price'; // was affected by the error in apiFeatures.js sort() problem
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate()
    const tours = await features.query

    //send response
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        })
});


exports.getTour = catchAsync(async (req, res, next) => {
        const tour = await Tour.findById(req.params.id)
        // Tour.findOne({_id: req.params.id})

        if (!tour){
            return next(new AppError('No tour found with that ID', 404))
        }

        res.status(200).json({
            status: 'success',
            data: {
                tour         // bug was failing when I try get specific ID from postman had written tours
            }
        })
});

exports.createTour = catchAsync(async (req, res, next) => {

    const newTour = await Tour.create(req.body)
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    // try {
        
    // } catch (err) {
    //     res.status(400).json({
    //         status: 'fail',
    //         message: err
    //     });
    // }
});

exports.updateTour = catchAsync(async (req, res, next) => {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!tour){
            return next(new AppError('No tour found with that ID', 404))
        }

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
});


exports.getTourStats = catchAsync(async (req, res, next) =>{
        const stats = await Tour.aggregate([
            {
                $match:{ratingsAverage: {$gte: 4.5}}
            },
            {
                $sort: {avgPrice: 1}
            },
            
            {
                $group: {
                    _id: {$toUpper: '$difficulty'},
                    numTours: {$sum: 1},
                    numRatings: {$sum: 'ratingsQuantity'},
                    avgRating:{$avg: '$ratingsAverage'},
                    avgPrice: {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max: '$price'}, 
                }
            }
        ])
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next)=>{
        const year = req.params.year * 1
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date (`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: {$month: '$startDates'},
                    numTourStarts: {$sum: 1},
                    tours: {$push: '$name'}
                }
            },
            {
                $addFields: {month: '$_id'}
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {numTourStarts: -1}
            },
            {
                $limit: 12
            }
        ])
        res.status(200).json({
            status: 'success',
            data: {
                plan : plan
            }
    
        })
});