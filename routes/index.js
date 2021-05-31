const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const db = require('./dateBase')
const stripe = require('stripe')('sk_test_51Ix7IvKb57Y9FnDq8pKByg5jlI0nqoCLiql27LQH49XhQeAk02kBqby3PmS0fSfGaGTVrGBgTsJyLCdHTJ2STJBp00W9TAaqeq')

mongoose.connect("mongodb://localhost:27017/applianceDB", { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function () {
  console.log('connection success.')
});

/* GET home page. */
router.get('/', function (req, res, next) {
  db.find(function (err, foundAppliances) {
    if (err) {
      console.log(err)
    } else {
      res.render('index', { foundAppliances });
    }
  })
});

router.get('/category/', function (req, res, next) {
  const { category } = req.query
  db.find({ category }, function (err, foundAppliances) {
    if (err) {
      console.log(err)
    } else {
      console.log(foundAppliances)
      res.render('index', { foundAppliances });
    }
  })
});

router.get('/product/:id', function (req, res, next) {
  const { id } = req.params
  db.find({ _id: id }, function (err, foundAppliance) {
    if (err) {
      console.log(err)
    } else {
      res.render('product', { foundAppliance });
    }
  })
});

router.post('/cart', function (req, res, next) {
  const { product_id } = req.body
  req.session.cart = req.session.cart || {}
  let cart = req.session.cart
  db.find({ _id: product_id }, function (err, foundItem) {
    if (cart[product_id] == null) {
      cart[product_id] = {
        id: foundItem[0].id,
        name: foundItem[0].name,
        category: foundItem[0].category,
        price: foundItem[0].price,
        qty: 1
      }
    } else {
      cart[product_id].qty++
    }
    res.redirect('/')
  })
});


router.get('/cart', function (req, res, next) {
  let cart = req.session.cart
  let displayCart = { items: [], total: 0 }
  for (let item in cart) {
    displayCart.items.push(cart[item])
    displayCart.total += (cart[item].qty * cart[item].price)
  }
  res.render('cart', { displayCart });
});

router.post('/payment', function (req, res, next) {
  const { stripeToken, amount } = req.body
  stripe.charges.create({
    amount: amount,
    currency: "USD",
    source: stripeToken
  }, function (err, charges) {
    if (err) {
      throw err
    }
    req.session.destroy(function () {
      res.redirect('/')
    })
  })
});


module.exports = router;
