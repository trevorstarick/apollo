"use strict"
express = require("express")
getservice = express.Router()
ECT = require("ect")
redis = require("redis")
async = require("async")
moment = require("moment")

appRoute = (__dirname).replace('/routes','/')
ectRender = ECT({ root : appRoute + '/views/ect' })

rdb = redis.createClient(6379, 'gingersnap.outpost.travel')
rdb.select 15

#Define outside of all functions
lastRuns = {}
gQueue = []
gRunning = []

#Sort object by keys. Will make ECT much easier.
sortKeysByOb = (myObj) ->
	keys = Object.keys(myObj)
	keys.sort()

	newOb = {}
	i = 0
	while i < keys.length
		newOb[keys[i]] = myObj[keys[i]]
		i++
	return newOb

#Pulls info from redis
redisPull = (req, res) ->
	async.parallel([
		lastRunsFunc = (cb1) ->
			rdb.keys 'gs_lastrun_*', (err, result) ->

				async.each(result, #Creates the object for each provider
					(item, acb1) ->
						rdb.get item, (err, v) ->
							item = item.replace('gs_lastrun_','')
							lastRuns[item] = {
								# queuePlace: -1,
								inQueue: false,
								running: false,
								lastCheck: 'Never',
								count: 'N/A',
								successRun: 'N/A',
								errorMessage: 'No error message found in Redis'
							}

							if v in [null, 'never']
								lastRuns[item]['d'] = 'Never'
							else
								t = moment.unix(parseInt(v))
								t = t.format("MMMM Do YYYY, h:mm a")
								lastRuns[item]['d'] = t

							acb1 null

					,(err) ->
						cb1 null)

		gQueueFunc = (cb2) ->
		 rdb.lrange 'gs_queue',0,-1, (err, result) ->
		 	if result in [null, undefined, 'null', 'undefined']
		 		gQueue = []
		 	else
		 		gQueue = result
			cb2 null

		gRunningFunc = (cb3) ->
			rdb.lrange 'gs_running',0,-1, (err, result) ->
				if result in [null, undefined, 'null', 'undefined']
					gRunning = []
				else
					gRunning = result
				cb3 null

	], (err, results) ->
		redisMerge(req, res)
	)

#Setup to see which providers have queue up or not.
redisMerge = (req, res) ->
	async.parallel([
		mergeQueue = (cb1) ->
			async.each(gQueue,
				(item, acb1) ->
					lastRuns[item]['inQueue'] = true
					acb1 null

				, (err) ->
					cb1 null)
		mergeRunning = (cb2) ->
			async.each(gRunning,
				(item, acb2) ->
					lastRuns[item]['running'] = true
					acb2 null

				, (err) ->
					cb2 null)

		lastChecks = (cb3) ->
			async.each(Object.keys(lastRuns),
				(item, acb3) ->
					rdb.get "gs_lastcheck_"+item, (err, v) ->
						if v in [null, undefined, 'null', 'undefined']
							#Skip
						else
							t = moment.unix(parseInt(v))
							t = t.format("MMMM Do YYYY, h:mm a")
							lastRuns[item]['lastCheck'] = t
						acb3 null
				, (err) ->
					cb3 null)

		providerCounts = (cb4) ->
			async.each(Object.keys(lastRuns),
				(item, acb4) ->
					rdb.get "gs_count_"+item, (err, v) ->
						if v in [null, undefined, 'null', 'undefined']
							#Skip
						else
							lastRuns[item]['count'] = v
						acb4 null
				, (err) ->
					cb4 null)

		successRun = (cb5) ->
			async.each(Object.keys(lastRuns),
				(item, acb5) ->
					rdb.get "gs_success_"+item, (err, v) ->
						if v in [null, undefined, 'null', 'undefined']
							#Skip
						else
							lastRuns[item]['successRun'] = v
						acb5 null
				, (err) ->
					cb5 null)

		errorMessage = (cb6) ->
			async.each(Object.keys(lastRuns),
				(item, acb6) ->
					rdb.get "gs_error_"+item, (err, v) ->
						if v in [null, undefined, 'null', 'undefined']
							#Skip
						else
							lastRuns[item]['errorMessage'] = v
						acb6 null
				, (err) ->
					cb6 null)

	], (err, results) ->
		#Render it.
		console.log sortKeysByOb(lastRuns)
		rdb.get "gs_count_total", (err, v) ->
			renderHTML = ectRender.render('get_service.ect', {providers: sortKeysByOb(lastRuns), totalCount:v})
			res.render('html', {
				html:renderHTML,
				page: {
					current: 'Get Service',
					icon: 'fa-list'
				},
				user: req.user
				})
	)


getservice.get "/", (req, res) ->
	redisPull(req, res)

module.exports = getservice