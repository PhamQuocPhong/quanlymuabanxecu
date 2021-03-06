const User = require('../models/user')
const Employee = require('../models/employee')
const Position = require('../models/position')
const UserNotification = require('../models/user_notification')
const helper = require('../helpers/helper')
const moment = require('moment')
const { Op } = require("sequelize")
const AwsService = require('../services/aws')
const config = require('../config')
const urlAvatar = config.URL_AVATAR_AWS

// get notifications of user for 7 days ago

let getNotificationUser = async (req, res) => {

	const userId = req.params.id
	var itemPerPage = req.query.itemPerPage
	var page = req.query.page
	var type = req.query.type
	var offset = 0
	if(page == 1){
		offset = 0
	}
	else{
		offset = ((page - 1) * itemPerPage) 
	}

	try {

		var before7Days = moment().subtract(7, 'days').format("YYYY-MM-DD HH:mm:ss")
		const userNotfiy = await UserNotification.findAll({
			include: [
				{
					attributes: [
						['id', 'userId']
					],
					model: User,
					as: 'sender',

					include: {
						attributes: ['fullName'],
						model: Employee,
					}

				},

				{
					
					attributes: [
						['id', 'userId']
					],
					model: User,
					as: 'receiver',
					include: {
						attributes: ['fullName'],
						model: Employee,
					}
				},
			],
			where: {
				receiverId: userId,
				type: type,
				createdAt: {
					[Op.gte]: before7Days
				}
			},

			offset: offset, 
			limit: itemPerPage, 
		})

		var retrieveData = []
		var userNotfiyLength = userNotfiy.length

		if(userNotfiyLength > 0){
			for(var i = 0; i < userNotfiyLength; i++){
				var spaceTime = helper.subtractNotifyDateTime(userNotfiy[i].createdAt, new Date())
				retrieveData.push({
					id: userNotfiy[i].id,
					name: userNotfiy[i].name,
					senderId:userNotfiy[i].sender.userId,
					senderName: userNotfiy[i].sender.employee.fullName,
					receiverId:userNotfiy[i].receiver.userId,
					receiverName: userNotfiy[i].receiver.employee.fullName,
					spaceTime: spaceTime
				})
			}	
		}
		return res.status(200).json({message: "Retrieve sucess", data: retrieveData})
	} catch(error) {
		return res.status(500).json(error)
	}

}

let getUser = async (req, res) => {

	const userId = req.params.id
	try {
		var data = await User.findOne({
			include: {
				model: Employee,
				include: {
					attributes: ['id', 'name'],
					model: Position
				}
			},

			where: {
				id: userId
			}
		})	

		return res.status(200).json({message: "Retrieve sucess", data: data})

	} catch(error) {
		// statements
		return res.status(500).json(error)
	}

}

let uploadAvatar = async (req, res) => {
	
	var avatar = req.body.avatar 
	var oldAvatarUrl = req.body.oldAvatarUrl
	var userId = req.params.id
	var typeUpload = "avatars"
	if(avatar) {

		AwsService.removeImageAws(oldAvatarUrl, typeUpload)

		await AwsService.uploadImageBase64(avatar, typeUpload, (url) => {
			var avatarName = AwsService.getCallbackURL(url)

			if(avatarName){
				User.update({
					avatar: avatarName
				}, 
				{
					where: {
						id: userId
					}
				})
				return res.status(200).json({message: "Upload avatar success", newAvatar: avatarName})
			}
		})
	}
}


module.exports = {
	getNotificationUser: getNotificationUser,
	getUser: getUser,
	uploadAvatar: uploadAvatar,
}