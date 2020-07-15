const VehiclePurchase = require('../models/vehicle_purchase')
const Employee = require('../models/employee')
const Customer = require('../models/customer')
const Vehicle = require('../models/vehicle')
const VehicleType = require('../models/vehicle_type')
const ReceptionCustomerSell = require('../models/reception_customer_sell')
const VehicleRepair = require('../models/vehicle_repair')
const helperFunctions = require('../helpers/function')

/*let vehicleList = (req, res) => {

	const vehicleList = [
		{
			id: 1,
			name: 'vison 2020',
			color: 'red',
			price: '1500',
			quantity: 1,
			image: '#',
			valid: 0,
			description: "xe vison 2020 màu đỏ",
			vehicleTypeId: 1

		},
		{
			id: 2,
			name: 'vison 2019',
			color: 'blue',
			price: '1500',
			quantity: 1,
			image: '#',
			valid: 0,
			description: "xe vison 2019 màu xanh",
			vehicleTypeId: 1

		},

		{
			id: 1,
			name: 'vison 2020',
			color: 'red',
			price: '1500',
			quantity: 1,
			image: '#',
			valid: 0,
			description: "xe vison 2020 màu đỏ",
			vehicleTypeId: 1

		}
		{
			id: 1,
			name: 'vison 2020',
			color: 'red',
			price: '1500',
			quantity: 1,
			image: '#',
			valid: 0,
			description: "xe vison 2020 màu đỏ",
			vehicleTypeId: 1

		}
		{
			id: 1,
			name: 'vison 2020',
			color: 'red',
			price: '1500',
			quantity: 1,
			image: '#',
			valid: 0,
			description: "xe vison 2020 màu đỏ",
			vehicleTypeId: 1

		}
		{
			id: 1,
			name: 'vison 2020',
			color: 'red',
			price: '1500',
			quantity: 1,
			image: '#',
			valid: 0,
			description: "xe vison 2020 màu đỏ",
			vehicleTypeId: 1

		}
	]

	return res.status(200).json(vehicleList)
}*/

let getAllVehicle = async (req, res) => {
	const vehicles = await Vehicle.findAll()
	return res.status(200).json(vehicles)
}

let getAllVehiclePaging = async(req, res) => {
	var itemPerPage = req.query.itemPerPage
	var page = req.params.page
	var offset = 0
	if(page == 1){
		offset = 0
	}
	else{
		offset = ((page - 1) * itemPerPage) 
	}

	const vehicles = await Vehicle.findAll({
		offset: offset, 
		limit: itemPerPage, 
		include: {
			model: VehicleType
		}
	})
	const counts  = Math.ceil(await Vehicle.count() / itemPerPage ) 

	return res.status(200).json({message: 'Retrieve success', data: vehicles, pageCounts: counts })
}

let getAllVehicleByType = async (req, res) => {

	const vehicleTypeId = req.query.vehicleTypeId

	const vehicles = await Vehicle.findAll({
		where: {
			vehicleTypeId: vehicleTypeId,
			valid: 1
		}
	})
	return res.status(200).json(vehicles)
}


let getAllVehiclePurchases = async (req, res) => {
	const vehiclePurchaseData = await VehiclePurchase.findAll()

	return res.status(200).json(vehiclePurchaseData)
}


let getAllVehiclePurchasePaging = async (req, res) => {

	var itemPerPage = req.query.itemPerPage
	var page = req.params.page
	var offset = 0
	if(page == 1){
		offset = 0
	}
	else{
		offset = ((page - 1) * itemPerPage) 
	}

	const vehiclePurchase = await VehiclePurchase.findAll({
		offset: offset, 
		limit: itemPerPage, 
		include: [
				{
					model: ReceptionCustomerSell,
					include: [
						{
							model: Customer
						},
						{
							model: Employee,
						}
					]
				}, 
				{
					model: VehicleRepair
				},
				{
					model: VehicleType
				}
			]
	})
	const counts  = Math.ceil(await VehiclePurchase.count() / itemPerPage ) 

	return res.status(200).json({message: 'Retrieve success', data: vehiclePurchase, pageCounts: counts })
}


let updateVehiclePurchase = async (req, res) => {

	var id = req.params.id
	var data = req.body
	await VehiclePurchase.update(data, {
		where: {
			id: id,
		},
		returning: true,
  		plain: true,
  		include: {
  			model: VehicleRepair
  		}
	}).then(response => {
		if(response){
			return res.json({message: 'Update success!', data: response[1]})
		}
	})
}

let getAllVehicleRepairPaging = async (req, res) => {

	var itemPerPage = req.query.itemPerPage
	var page = req.params.page
	var offset = 0
	if(page == 1){
		offset = 0
	}
	else{
		offset = ((page - 1) * itemPerPage) 
	}

	const vehicleRepair = await VehicleRepair.findAll({
		offset: offset, 
		limit: itemPerPage, 
		include: [
				{
					model: VehiclePurchase,
					include: {
						model: VehicleType
					}
				}
			]
	})
	const counts  = Math.ceil(await VehicleRepair.count() / itemPerPage ) 

	return res.status(200).json({message: 'Retrieve success', data: vehicleRepair, pageCounts: counts })
}



let createVehicleRepair = async (req, res) => {

	var data = req.body

	try{
        var newVehicleRepair = await VehicleRepair.create(data);
        var returnRecord = await VehicleRepair.findOne({
  			where: { 
  				vehiclePurchaseId: data.vehiclePurchaseId,
  			},
  			include: {
  				model: VehiclePurchase
  			}
		})

        return res.status(200).json({message: 'Success', data: returnRecord})
 
	}catch(e){
		return res.status(500).json({message: 'Network Error'})
	}
}


let publishVehicleRepair = async (req, res) => {
	var vehicleRepair = req.body
	var vehiclePurchase = vehicleRepair.vehiclePurchase
	var vehicleRepairId = req.params.id

	// if admin publish => add this vehicle to my inventory

	if(!vehicleRepair.fixFlg === 1){
		return res.status(401).json({message: 'Update failed!'})
	}

	try{
		await VehicleRepair.update(vehicleRepair, {
			where: {
				id: vehicleRepairId
			}
		}).then(async (response) => {


			await Vehicle.create({
				name: vehiclePurchase.name,
				code: vehiclePurchase.code,
				registrationPlate: vehiclePurchase.registrationPlate,
				color: vehiclePurchase.color,
				quantity: 1,
				image: vehiclePurchase.image,
				price: vehicleRepair.price,
				fixPrice: vehicleRepair.fixPrice,
				buyPrice: vehiclePurchase.price,
				vehicleTypeId: vehiclePurchase.vehicleTypeId,
				valid: 1
			})
		

			var returnRecord = await VehicleRepair.findOne({
				where: {
					id: vehicleRepairId
				},	
			})
			return res.status(200).json({message: 'Update success!', data: returnRecord})
			
		})

	}catch(error){
		return res.status(500).json(error)
	}

}

let updateVehicleRepair = async (req, res) => {

	var vehicleRepair = req.body
	var vehiclePurchase = vehicleRepair.vehiclePurchase
	var vehicleRepairId = req.params.id
	try {

		await VehicleRepair.update(vehicleRepair, {
			where: {
				id: vehicleRepairId
			}
		}).then(async (response) => {

			if(response){
				var returnRecord = await VehicleRepair.findOne({
					where: {
						id: vehicleRepairId
					},
					include: {
						model: VehiclePurchase
					}	
				})
				return res.status(200).json({message: 'Update success!', data: returnRecord})
			}
		})
	} catch(error) {
		return res.status(500).json(error)
	}
}



module.exports = {
	getAllVehicle: getAllVehicle,
	getAllVehiclePaging: getAllVehiclePaging,
	getAllVehicleByType: getAllVehicleByType,
	getAllVehiclePurchases: getAllVehiclePurchases,
	getAllVehiclePurchasePaging: getAllVehiclePurchasePaging,
	getAllVehicleRepairPaging: getAllVehicleRepairPaging,
	createVehicleRepair: createVehicleRepair,
	updateVehiclePurchase: updateVehiclePurchase,
	updateVehicleRepair: updateVehicleRepair,
	publishVehicleRepair: publishVehicleRepair
}