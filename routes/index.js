module.exports = {
	auth: {
		login: require('./auth/login.js'),
		renewToken: require('./auth/renewToken.js'),
		getUserInfo: require('./auth/getUserInfo.js')
	},
	user: {
		register: require('./user/register.js'),
		checkUsername: require('./user/checkUsername.js'),
		activate: require('./user/activate.js')
	},
	project: {
		new: require('./project/new.js'),
		list: require('./project/list.js'),
		compile: require('./project/compile.js'),
		edit: require('./project/edit.js'),
		delete: require('./project/delete.js')
	},
	file: {
		new: require('./file/new.js'),
		get: require('./file/get.js'),
		list: require('./file/list.js'),
		delete: require('./file/delete.js'),
		rename: require('./file/rename.js')
	},
	job: {
		status: require('./job/status.js'),
		result: require('./job/result.js'),
		log: require('./job/log.js')
	}
};