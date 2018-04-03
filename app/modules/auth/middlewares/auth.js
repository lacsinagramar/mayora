exports.hasUser = (req, res, next) => {
    if (req.session && !req.session.user) return next();
    
    if(req.session.user.strTenantId) return res.redirect('/tenant');
    else if(req.session.user.strLandlordID) return res.redirect('/landlord')
}

exports.isTenant = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.strTenantId) return next();
    
    return res.redirect('/index');
}

exports.isVerifiedTenant = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.strTenantId && req.session.user.booStatus === 1) return next();
    
    return res.redirect('/logout');
}

exports.isLandlord = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.strLandlordID) return next();
    
    return res.redirect('/index');
}

exports.isVerifiedLandlord = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.strLandlordID && req.session.user.booStatus === 3) return next();
    
    return res.redirect('/landlord/verify');
}

exports.isNotVerifiedLandlord = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.strLandlordID && req.session.user.booStatus !== 3) return next();
    
    return res.redirect('/index');
}

exports.isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.usernameAdmin) return next();

    return res.redirect('/index');
}