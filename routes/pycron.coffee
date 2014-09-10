"use strict"
express = require("express")
pycron = express.Router()
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

redisPull = (req, res) ->
	rdb.keys 'pc_lastrun_*', (err, result) ->
		async.each(result, #Creates the object for each provider
			(item, acb1) ->
				rdb.get item, (err, v) ->
					item = item.replace('pc_lastrun_','')
					t = moment.unix(parseInt(v))
					t = t.format("MMMM Do YYYY, h:mm a")
					lastRuns[item] = {
						runTime: t,
						success: 'True'
					}
					acb1 null
			, (err) ->
				fillKeys(req, res))


fillKeys = (req, res) ->
	async.parallel([
		success = (cb1) ->
			async.each(Object.keys(lastRuns),
				(item, acb1) ->
					rdb.get "pc_success_"+item, (err, v) ->
						if v in [null, undefined, 'null', 'undefined']
							#Skip
						else
							lastRuns[item]['success'] = v
						acb1 null
				, (err) ->
					cb1 null)
		], (err, results) ->
			renderMe(req, res))

renderMe = (req, res) ->
	console.log sortKeysByOb(lastRuns)
	renderHTML = ectRender.render('pycron.ect', {crons: sortKeysByOb(lastRuns)})
	res.render('html', {
		html:renderHTML,
		page: {
			current: 'PyCron',
			icon: 'fa-list'
		},
		user: req.user
		})

pycron.get "/", (req, res) ->
	redisPull(req, res)

module.exports = pycron