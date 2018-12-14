// Require statements for all dependencies
const inquirer = require('inquirer')
const mysql = require('mysql')
const Table = require('cli-table')
const readline = require('readline')

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
// Initialization function to connect database
var bdb = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'StillGonnaSendIt',
    database: 'bamazonDB'
});

bdb.connect((err) => {
    if (err) throw err;
    else {
        open();
        console.log("...")
        console.log("Successfully connected to bamazonDB");
        io.init();
    }
});

var user;
var productListing;
var tempReqList = [];
var session = {
    knowsAdmin: false,
    hasViewedProducts: false,
    hasPurchased: false,
    purchQ: 0,
    purchT: 0,
    cart: {
        contents: [],
        count: 0,
        total: 0,
        active: false,
        update: function () {
            this.count = 0;
            this.total = 0;
            // ID, name, amt, unitPrice, total
            if (this.contents.length === 0) {
                console.log("Your cart is empty.")
            } else {
                for (var i in this.contents) {
                    let cartItem = this.contents[i]
                    this.count += cartItem.amt
                    this.total += cartItem.total
                }
            }
        },
        clear: function () {
            this.contents = []
            this.count = 0
            this.total = 0
        }
    }
}

function Product(attr) {
    this.product_name = attr.name;
    this.dept_name = attr.dept;
    this.cost = parseFloat(attr.cost);
    this.price = parseFloat(attr.price);
    this.stock = parseInt(attr.stock);
}

function User(attr) {
    this.username = attr.username;
    this.password = attr.password;
    this.admin = attr.admin;
}

function open() {
    console.log("")
    console.log("===== + ===== + ===== + ===== + ===== + ===== + ===== + ===== + ===== + ===== + ===== + =====");
    console.log("  ----\\         /-\\       |--\\_/--|       /-\\       |_______  |    /-----\\   |---  |-|                            ");
    console.log("  | o  |       / ^ \\      |       |      /   \\             / /    / /---\\ \\  | |\\ \\| |                     ");
    console.log("  |   /       / / \\ \\     | |\\_/| |     / / \\ \\          / /      | |   | |  | | \\ | |                    ");
    console.log("  | |\\ \\     / /___\\ \\    | |   | |    / /___\\ \\       / /        | |   | |  | |  \\  |                 ");
    console.log("  | |/ /    / /_____\\ \\   | |   | |   / /_____\\ \\    / /_______   | \\___/ |  | |   | |                        ");
    console.log("  ----/    /_/       \\_\\  |_|   |_|  /_/       \\_\\  |__________|   \\_____/   |_|   |_|                                 ");
    console.log("===== + ===== + ===== + ===== + ===== + ===== + ===== + ===== + ===== + ===== + ===== + =====");
}

var io = {
    //*COMPLETE
    init: function () {
        inquirer.prompt([
            {
                type: "confirm",
                message: "Are you a registered Bamazon user?",
                name: "isUser"
            }
        ]).then(
            (ans) => {
                if (ans.isUser === true) {
                    io.login();
                } else {
                    io.newUser();
                }
            });
    },
    //*COMPLETE
    login: function () {
        // Currently commenting out login function to auto-enter my credentials for testing..!
        // ZACH - DONT FORGET TO CHANGE THIS BEFORE SUBMITTING
        // (I might forget)

        inquirer.prompt([
            {
                type: "input",
                message: "Username: ",
                name: "nameIO"
            },
            {
                type: "password",
                message: "Password: ",
                name: "pwIO"
            }
        ]).then((ans) => {
            console.log("Logging you in...");
            hdl.loginAttempt({ username: ans.nameIO, password: ans.pwIO });
        });

        // hdl.loginAttempt({ username: "zrheaume", password: "bamazonMan" });
    },
    //*COMPLETE
    newUser: function () {
        inquirer.prompt([
            {
                type: "input",
                message: "Please select a username less than 12 characters long\nUsername: ",
                name: "newUsername"
            },
            {
                type: "input",
                message: "Please select a password less than 12 characters long\nPassword: ",
                name: "newPassword"
            },
            {
                type: "confirm",
                message: "Add administrator priveleges? ",
                name: "isAdmin"
            }
        ]).then((ans) => {
            let newUserPacket = { username: ans.newUsername, password: ans.newPassword, admin: false, awaiting_admin_approval: ans.isAdmin }
            hdl.newUser(newUserPacket)
            // console.log(`Success! Thanks ${ans.newUsername}, let's get started!`);
        })
    },
    //*COMPLETE
    menu: function () {
        let availableActions = ["View products", "Buy products", "View cart\n\n", "Exit"]
        if (user.admin === 1) {
            if (!session.knowsAdmin) {
                console.log(`\n"${user.username}" is an administrator account.\nYou will have access to admin functions via "Manager Tools"\n\n`)
                session.knowsAdmin = true
            }
            availableActions = ["View products", "Buy products", "View cart\n\n", "Manager tools", "Exit"]
        }
        inquirer.prompt([
            {
                type: "list",
                message: "What would you like to do?",
                choices: availableActions,
                name: "actSel"
            }
        ]).then((ans) => {
            switch (ans.actSel) {
                case "View products":
                    build.productList(true)
                    io.viewProducts()
                    break
                case "Buy products":
                    io.buyProduct()
                    break
                case "View cart\n\n":
                    if (session.cart.contents.length === 0) {
                        console.log("Your cart is empty")
                        io.menu()
                    }
                    else if (session.cart.contents.length > 0) {
                        io.viewCart()
                    }
                    break
                case "Manager tools":
                    io.manager()
                    break
                case "Exit":
                    process.exit()
            }
        })
    },
    //*COMPLETE
    viewProducts: function () {
        setTimeout(() => {
            inquirer.prompt({
                type: "list",
                message: "What would you like to do?",
                choices: ["Buy product", "Go back"],
                name: "actSel"
            }).then((ans) => {
                switch (ans.actSel) {
                    case "Buy product":
                        io.buyProduct();
                        break;
                    case "Go back":
                        io.menu();
                        break;
                }
            });
        }, 150)
    },
    //*COMPLETE
    buyProduct: function () {
        if (!session.hasViewedProducts) {
            build.productList(true)
        }
        setTimeout(() => {
            inquirer.prompt(
                [{
                    type: "input",
                    message: "Please enter the ID of the product you wish to buy.",
                    name: "purchaseID",
                    validate: function (input) {
                        if (isNaN(parseInt(input)) || parseInt(input) < 1) {
                            return false
                        } else {
                            return true
                        }
                    }
                },
                {
                    type: "input",
                    message: "Quantity",
                    name: "purchaseQuantity",
                    validate: function (input) {
                        if (isNaN(parseInt(input)) || parseInt(input) < 1) {
                            return false
                        } else {
                            return true
                        }
                    }
                }
                ]).then((ans) => {
                    hdl.addToCart(parseInt(ans.purchaseID), parseInt(ans.purchaseQuantity))
                })
        }, 150
        )
    },
    //*COMPLETE
    confirmAddToCart: function (cartItem) {
        inquirer.prompt({
            type: "confirm",
            message: "Add to cart?",
            name: "purchaseConfirm"
        }).then((ans) => {
            if (ans.purchaseConfirm === true) {
                session.cart.contents.push(cartItem)
                session.cart.update()
                io.afterAddToCart()
            } else {
                io.viewProducts()
            }
        })
    },
    //*COMPLETE
    afterAddToCart: function () {
        inquirer.prompt(
            [{
                type: "list",
                message: "Thanks! What would you like to do now?",
                choices: ["Add another", "Go back", "View cart"],
                name: "action"
            }]
        ).then((ans) => {
            switch (ans.action) {
                case "Add another":
                    io.buyProduct();
                    break;
                case "Go back":
                    io.menu();
                    break;
                case "View cart":
                    io.viewCart();
                    break;
            }
        })
    },
    //*COMPLETE
    viewCart: function () {
        console.log("attempting to view cart")
        if (session.cart.contents.length === 0) {
            console.log("Your cart is currently empty")
            io.menu()
        } else {
            session.cart.update()
            build.cart()
            inquirer.prompt([
                {
                    type: "list",
                    message: "What would you like to do?",
                    choices: ["Complete order", "Remove item", "Clear cart", "Go back"],
                    name: "actSel"
                }
            ]).then((ans) => {
                switch (ans.actSel) {
                    case "Complete order":
                        inquirer.prompt({
                            type: "confirm",
                            message: `Confirm your purchase of ${session.cart.count} items for a total of $${session.cart.total}?`,
                            name: "yes"
                        }).then((ans) => {
                            if (ans.yes) {
                                hdl.cartDump()
                            }
                            else {
                                io.menu()
                            }
                        })
                        break
                    case "Remove item":
                        io.removeFromCart()
                        break
                    case "Clear cart":
                        session.cart.clear()
                        io.menu()
                        break
                    case "Go back":
                        io.menu()
                        break

                }
            })
        }

    },
    //*COMPLETE
    removeFromCart: function () {
        inquirer.prompt([{
            type: "input",
            message: "Enter the ID of the item you wish to remove",
            name: "toRemove"
        },
        {
            type: "confirm",
            message: "Are you sure?",
            name: "verify"
        }
        ])
            .then((ans) => {
                hdl.removeCartItem(ans.toRemove)
            })
    },
    //*COMPLETE
    manager: function () {
        inquirer.prompt({
            type: "list",
            message: "Manager Tools v1.0\n\n",
            choices: ["Manage products", "Manage users", "Back"],
            name: "manageWhat"
        }).then((ans) => {
            switch (ans.manageWhat) {
                case "Manage products":
                    io.manageProducts()
                    break
                case "Manage users":
                    io.manageUsers()
                    break
                case "Back":
                    io.menu()
                    break
            }
        })
    },
    //*COMPLETE
    manageProducts: function () {
        inquirer.prompt({
            type: "list",
            message: "Retail tools",
            choices: ["Add product", "Remove product", "Adjust inventory", "Adjust pricing", "Go back"],
            name: "actSel"
        }).then((ans) => {
            switch (ans.actSel) {
                case "Add product":
                    io.addProduct()
                    break
                case "Remove product":
                    io.removeProduct()
                    break
                case "Adjust inventory":
                    io.adjInventory()
                    break
                case "Adjust pricing":
                    io.adjPricing()
                    break
                case "Go back":
                    io.manager()
                    break
            }
        })
    },
    manageUsers: function () {
        inquirer.prompt({
            type: "list",
            message: "User management",
            choices: ["View users", "Remove user", "Review administrator requests", "Go back"],
            name: "actSel"
        }).then((ans) => {
            switch (ans.actSel) {
                case "View users":
                    build.userListFull()
                    setTimeout(io.manager, 100)
                    break
                case "Remove user":
                    io.removeUser()
                    break
                case "Review administrator requests":
                    io.viewRequests()
                    break
                case "Go back":
                    io.manager()
                    break
            }
        })
    },
    addProduct: function () {
        console.log("Please enter...\n")
        inquirer.prompt([
            {
                type: "input",
                message: "Product name",
                name: "name"
            },
            {
                type: "input",
                message: "Product department",
                name: "dept"
            },
            {
                type: "input",
                message: "Wholesale cost",
                name: "cost"
            },
            {
                type: "input",
                message: "Retail price",
                name: "price"
            },
            {
                type: "input",
                message: "Starting inventory",
                name: "stock"
            }
        ]).then((ans) => {
            let productToAdd = new Product(ans)
            // console.log(productToAdd)
            io.confirmAddProduct(productToAdd)
        })
    },
    confirmAddProduct: function (dat) {
        console.log("Name:           " + dat.product_name)
        console.log("Department:     " + dat.dept_name)
        console.log("Wholesale cost: " + dat.cost)
        console.log("Price:          " + dat.price)
        console.log("Stock:          " + dat.stock)
        inquirer.prompt({
            type: "confirm",
            message: "Is this correct?",
            name: "approved"
        }).then((ans) => {
            if (ans.approved) {
                console.log("\n...Adding to product database")
                toolbox.product.add(dat)
            }
            else {
                io.manager()
            }
        })
    },
    removeProduct: function () {
        build.simpleProductList()
        inquirer.prompt([
            {
                type: "input",
                message: "Please enter the id of the product you wish to remove",
                name: "removeWhich"
            },
            {
                type: "confirm",
                message: "Are you sure you want to remove this product?\n\nIMPORTANT: This product and its resective data will be permanently deleted.",
                name: "approved"
            }]).then((ans) => {
                if (ans.approved) {
                    toolbox.product.remove(ans.removeWhich)
                }
            })
    },
    adjInventory: function () {
        build.productInventory()
        setTimeout(() => {
            inquirer.prompt([
                {
                    type: "input",
                    message: "Enter the ID of the product you'd like to adjust: ",
                    name: "adjID"
                },
                {
                    type: "input",
                    message: "Enter the corrected stock available: ",
                    name: "adjStock"
                },
                {
                    type: "confirm",
                    message: "Have you enetered the correct information?",
                    name: "approved"
                }
            ]).then((ans) => {
                if (ans.approved) {
                    toolbox.product.adjustInventory(ans.adjID, ans.adjStock)
                }
            })
        }, 150)
    },
    adjPricing: function () {
        build.productPricing()
        setTimeout(() => {
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select which value you are adjusting",
                    choices: ["Cost", "Price"],
                    name: "adjType"
                },
                {
                    type: "input",
                    message: "Enter the ID of the product you are editing: ",
                    name: "adjID"
                },
                {
                    type: "input",
                    message: "Enter the new value: ",
                    name: "adjValue"
                },
                {
                    type: "confirm",
                    message: "Have you entered the correct information?",
                    name: "approved"
                }
            ]).then((ans) => {
                let newVal = parseFloat(ans.adjValue)
                if (ans.approved) {
                    toolbox.product.adjustPricing(ans.adjID, newVal, ans.adjType)
                }
                else {
                    io.manager()
                }
            })
        }, 150)
    },
    removeUser: function () {
        build.userListFull()
        setTimeout(() => {
            inquirer.prompt([
                {
                    type: "input",
                    message: "Please enter the id of the user you want to remove: ",
                    name: "remID"
                },
                {
                    type: "confirm",
                    message: "Are you sure? The selected user will be removed permantly.",
                    name: "approved"
                }
            ]).then((ans) => {
                if (ans.approved) {
                    toolbox.user.remove(ans.remID);
                }
            })
        }, 150)
    },
    viewRequests: function () {
        build.activeReqList()
        setTimeout(() => {
            inquirer.prompt([
                {
                    type: "list",
                    message: "What would you like to do?",
                    choices: ["Approve all", "Approve one", "Deny all", "Deny one", "Go back"],
                    name: "who"
                }
            ]).then((ans) => {
                switch (ans.who) {
                    case "Approve all":
                        toolbox.user.replyAll(tempReqList, true)
                        break
                    case "Approve one":
                        io.selectUser(true)
                        break
                    case "Deny all":
                        toolbox.user.replyAll(tempReqList, false)
                        break
                    case "Deny one":
                        io.selectUser(false)
                        break
                    case "Go back":
                        io.manageUsers()
                        break
                }
            })
        }, 150)
    },
    selectUser: function (approved) {
        inquirer.prompt({
            type: "input",
            message: "Enter the id of the user you're reviewing: ",
            name: "reviewID"
        }).then((ans) => {
            toolbox.user.reviewReq(ans.reviewID, approved)
            setTimeout(()=>{io.manageUsers()},750)
        })
    }
}

var toolbox = {
    product: {
        //TODO: Add product, remove product, adjust inventory, adj pricing
        add: function (newProduct) {
            // attr.product_name;
            // attr.dept_name;
            // attr.price;
            // attr.stock;
            // attr.cost;
            bdb.query("INSERT INTO products SET ?",
                {
                    product_name: newProduct.product_name,
                    dept_name: newProduct.dept_name,
                    price: newProduct.price,
                    stock: newProduct.stock,
                    cost: newProduct.cost
                }, (err, res) => {
                    if (err) throw err
                    console.log("Product added!")
                    io.manager()
                })
        },
        remove: function (ID) {
            bdb.query("DELETE FROM products WHERE ?", { item_id: ID }, (err, res) => {
                if (err) throw err
                console.log(`Successfully removed product with id ${ID} from listing.`)
                io.manager()
            })
        },
        adjustInventory: function (ID, newStock) {
            bdb.query("UPDATE products SET ? WHERE ?", [{ stock: newStock }, { item_id: ID }], (err, res) => {
                if (err) throw (err)
                console.log(`Stock of product with id ${ID} succesfully adjusted to ${newStock}`)
                io.manager()
            })
        },
        adjustPricing: function (ID, newValue, type) {
            let newVal = {}
            if (type === "Price") {
                newVal.price = newValue
            }
            else if (type === "Cost") {
                newVal.cost = newValue
            }
            bdb.query("UPDATE products SET ? WHERE ?", [newVal, { item_id: ID }], (err, res) => {
                if (err) throw err
                console.log(`The ${type} of item with id ${ID} has been changed to ${newValue}`)
                io.manager()
            })
        }
    },
    //TODO: View users, remove user, review admin reqs
    user: {
        remove: function (ID) {
            bdb.query("DELETE FROM users WHERE ?", { user_id: ID }, (err, res) => {
                if (err) throw err
                console.log("Successfully removed user")
                io.manager()
            })
        },
        reviewReq: function (ID, isApproved) {
            console.log(`Checking to approve ${ID}`)
            let adminStatus = false
            if (isApproved) { adminStatus = true }
            console.log(`Admin status: ${adminStatus}`)
            bdb.query("UPDATE users SET ? WHERE ?", [{ admin: adminStatus, awaiting_admin_approval: false }, { user_id: ID }], (err, res) => {
                if (err) throw err
                if (isApproved) {
                    console.log("Admin status successfully awarded")
                } else {
                    console.log("Admin status successfully denied")
                }
            })
        },
        replyAll: function (userList, approved) {
            for (var i in userList) {
                let thisUser = userList[i]
                toolbox.user.reviewReq(thisUser[0], approved)
            }
            io.manageUsers()
        }
    }
}

var hdl = {
    newUser: function (usrDat) {
        bdb.query("SELECT username FROM users WHERE ?", { username: usrDat.username }, (err, res) => {
            if (err) throw err
            if (res.length === 0) {
                bdb.query("INSERT INTO users SET ?", { username: usrDat.username, password: usrDat.password, admin: false, awaiting_admin_approval: usrDat.awaiting_admin_approval }, (err, res) => {
                    if (err) throw err
                    console.log(`Account successfully created! Thanks ${usrDat.username}, directing you to the main menu`)
                    if (usrDat.awaiting_admin_approval) {
                        console.log("\n\nIMPORTANT: You will not receive administrative permissions until your account has been approved by a current admin\n\n")
                    }
                    hdl.loginAttempt({ username: usrDat.username, password: usrDat.password })
                })
            }
            else {
                console.log("That username is already taken!\nPlease try another one.\n")
                io.newUser()
            }
        })

    },
    loginAttempt: function (credentials) {
        bdb.query("SELECT * FROM USERS WHERE ?", { username: credentials.username }, (err, res) => {
            if (err) throw err;
            if (res[0].password === credentials.password) {
                console.log(`Success! Thanks ${credentials.username}! Let's get started`);
                user = new User(res[0])
                io.menu();
            }
            else {
                console.log("Something went wrong! Your username or password was incorrect!");
                io.login();
            }
        })
    },
    addToCart: function (ID, amt) {
        for (var i in productListing) {
            let thisProduct = productListing[i]
            let orderTotal = thisProduct.price * amt
            if (thisProduct.item_id === ID) {
                let cartItem = {
                    ID: ID,
                    name: thisProduct.product_name,
                    amt: parseInt(amt),
                    unitPrice: thisProduct.price,
                    total: orderTotal
                }
                console.log(`Youre adding ${amt} of ${thisProduct.product_name} at ${thisProduct.price} for a total of $${cartItem.total}`)
                io.confirmAddToCart(cartItem)
            }
        }

    },
    purchase: function (ID, amt) {
        bdb.query("SELECT stock FROM products WHERE ?", { item_id: ID }, (err, res) => {
            if (err) throw err
            console.log(res[0].stock)
            if (res[0].stock >= amt) {
                let newStock = res[0].stock - amt
                // console.log(newStock)
                bdb.query("UPDATE products SET ? where ?", [{ stock: newStock }, { item_id: ID }], (err, res) => {
                    if (err) throw err
                    console.log("Success!")
                    // io.menu()
                })
            } else {
                console.log("Hmm, looks like something went wrong.")
                // io.menu()
            }

        })
    },
    cartDump: function () {
        let purchList = session.cart.contents
        for (var q in purchList) {
            hdl.purchase(purchList[q].ID, purchList[q].amt)
        }
        console.log("...")
        console.log("\n\nSuccess! Your order has been placed!")
        session.cart.clear()
        io.menu()
    },
    removeCartItem: function (remID) {
        let currentCart = session.cart.contents
        let newCart = []
        var removed;
        for (var i in currentCart) {
            if (currentCart[i].ID == remID) {
                console.log("found product to remove")
                removed = currentCart[i]
            }
            else {
                newCart.push(currentCart[i])
            }
        }
        session.cart.contents = newCart
        io.viewCart()
    }
}

var build = {
    productList: function (display) {
        bdb.query("SELECT * FROM products", (err, res) => {
            if (err) throw err
            console.log("")
            productListing = res

            let productTable = new Table({
                head: ['ID', 'Product', 'Department', 'Price'],
                colWidths: [10, 75, 50, 10]
            });
            for (var i in res) {
                let item = res[i]
                productTable.push([item.item_id, item.product_name, item.dept_name, item.price])
            }
            if (display) {
                console.log(productTable.toString())
                session.hasViewedProducts = true
            }
        })
    },
    simpleProductList: function () {
        bdb.query("SELECT item_id, product_name FROM products", (err, res) => {
            if (err) throw err
            console.log("")

            let simpleProductTable = new Table({
                head: ['ID', 'Product'],
                colWidths: [10, 75]
            });
            for (var i in res) {
                let item = res[i]
                simpleProductTable.push([item.item_id, item.product_name])
            }
            console.log(simpleProductTable.toString())
        })
    },
    productInventory: function () {
        bdb.query("SELECT item_id, product_name, stock FROM products", (err, res) => {
            if (err) throw err
            console.log("")

            let prodInvTable = new Table({
                head: ['ID', 'Product', 'Stock'],
                colWidths: [10, 75, 15]
            });
            for (var i in res) {
                let item = res[i]
                prodInvTable.push([item.item_id, item.product_name, item.stock])
            }
            console.log(prodInvTable.toString())
        })
    },
    productPricing: function () {
        bdb.query("SELECT item_id, product_name, cost, price FROM products", (err, res) => {
            if (err) throw err
            console.log("")

            let priceTable = new Table({
                head: ['ID', 'Product', 'Wholesale', 'Retail'],
                colWidths: [10, 75, 20, 20]
            });
            for (var i in res) {
                let item = res[i]
                priceTable.push([item.item_id, item.product_name, item.cost, item.price])
            }
            console.log(priceTable.toString())
        })
    },
    userListFull: function () {
        bdb.query("SELECT user_id, username, admin FROM users", (err, res) => {
            if (err) throw err
            console.log("")

            let userTable = new Table({
                head: ['User id', 'Username', 'Administrator'],
                colWidths: [10, 60, 30]
            });
            for (var i in res) {
                let item = res[i]
                let adminStatus = false
                if (item.admin == 1) { adminStatus = true }
                userTable.push([item.user_id, item.username, adminStatus])
            }
            console.log(userTable.toString())
        })
    },
    activeReqList: function () {

        bdb.query("SELECT user_id, username, awaiting_admin_approval FROM users", (err, res) => {
            if (err) throw err
            console.log("")

            let reqTable = new Table({
                head: ['User id', 'Username', 'Awaiting Approval'],
                colWidths: [10, 60, 30]
            });
            for (var i in res) {
                let item = res[i]
                let awtngAppStatus = "No"
                if (item.awaiting_admin_approval == 1) {
                    awtngAppStatus = "Yes"
                    reqTable.push([item.user_id, item.username, awtngAppStatus])
                    tempReqList.push([item.user_id, item.username, awtngAppStatus])
                }
            }
            console.log(reqTable.toString())
        })
    },
    cart: function () {
        let cartTable = new Table({
            head: ['ID', 'Product', 'Unit Price', 'Quantity', 'Total'],
            colWidths: [10, 60, 15, 15, 15]
        })
        let cartArr = session.cart.contents
        for (var j in cartArr) {
            let thisCartItem = cartArr[j]
            cartTable.push([thisCartItem.ID, thisCartItem.name, thisCartItem.unitPrice, thisCartItem.amt, thisCartItem.total])
        }
        cartTable.push(["", "", "", "", ""])
        cartTable.push(["", "", "", session.cart.count, session.cart.total])
        console.log(cartTable.toString())
        // io.menu()
    }
}