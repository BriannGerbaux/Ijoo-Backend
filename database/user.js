const client = require('./connect');
const jwt = require("jsonwebtoken");

const userCollection = client.db("ijoo-db").collection("users");
const cartCollection = client.db("ijoo-db").collection("carts");
const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

const get = async (email) => {
    try {
        var obj = { "email": email };
        var res = await userCollection.findOne(obj);
        return res;
    } catch (error) {
        throw error;
    }
}

const create = async (username, email, passwordHash) => {
    try {
        var cart = await cartCollection.insertOne({"item_number": 0, items: []})
        console.log(cart);
        var obj = {
            "username": username,
            "email": email,
            "password_hash": passwordHash,
            "cart_id": cart.insertedId
        };
        var res = await userCollection.insertOne(obj);
        console.log(res);
        await cartCollection.updateOne({"_id": cart.insertedId},
        {
            $set: {
                "user_id": res.insertedId
            }
        })
    } catch(error) {
        console.log(error);
        throw error;
    }
}

const exist = async (email) => {
    try {
        var obj = {"email": email};
        var alreadyExist = true;
        var res = await userCollection.findOne(obj);
        if (res == null) alreadyExist = false;
        return alreadyExist;
    } catch (error) {
        console.log(error);
        throw error
    }
}

const remove = (email, passwordHash) => {
    var obj = {"email": email, "password_hash": passwordHash};
    userCollection.deleteOne(obj, (err, res) => {
        if (err) throw err;
        console.log("Deleted 1 user");
    });
}

module.exports = {create, exist, remove, get, verifyToken};