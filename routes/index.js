module.exports = {
	auth: {
		login: require('./auth/login.js'),
		renewToken: require('./auth/renewToken.js'),
		getUserInfo: require('./auth/getUserInfo.js')
	},
	user: {
		register: require('./user/register.js'),
		checkUsername: require('./user/checkUsername.js')
	},
	project: {
		new: require('./project/new.js'),
		list: require('./project/list.js')
	},
	file: {
		new: require('./file/new.js'),
		get: require('./file/get.js'),
		list: require('./file/list.js'),
		delete: require('./file/delete.js')
	}
};