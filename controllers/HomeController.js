
exports.Main = (req,res) => {
    res.render("index");
}
exports.register = (req,res) => {
    res.render("register");
}
exports.login = (req,res) => {
    res.render("login");
}
exports.search = (req,res) => {
    res.render("search");
}
exports.tickets = (req,res) => {
    res.render("tickets");
}
exports.notFound = (req,res) => {
    res.render("not-found");
}
exports.customers = (req,res) => {
    res.render("customers");
}
exports.preOrder = (req,res) => {
    res.render("pre-order");
}

