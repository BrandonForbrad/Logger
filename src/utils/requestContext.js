function isAdmin(req) {
	return !!req.isAdmin;
}

function getCurrentUser(req) {
	return req.currentUser || null;
}

module.exports = {
	isAdmin,
	getCurrentUser,
};
