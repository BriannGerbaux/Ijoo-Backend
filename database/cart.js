const client = require('./connect');
const user = require('./user');
const cartCollection = client.db("ijoo-db").collection("carts");

const get = async (email) => {
    const userObj = await user.get(email);
    console.log(userObj);
    const allValues = await cartCollection.find({ "_id": userObj.cart_id }).project({user_id: 0, id: 0}).toArray();
    console.log(allValues);
    return allValues[0];
}

const add = async (email, travel_id) => {
    const userObj = await user.get(email);
    const cart = await cartCollection.findOne({ "_id": userObj.cart_id })
    if (cart.items.find(e => e.travel_id === travel_id) ) {
        await cartCollection.updateOne({ "_id": userObj.cart_id, "items.travel_id": travel_id },
        { $inc: { "items.$.quantity": 1 } } )
    } else {
        await cartCollection.updateOne({ "_id": userObj.cart_id },
        {
            $push: {
                "items": {
                    "travel_id": travel_id,
                    "quantity": 1
                }
            }
        });
    }
}

const remove = async (email, travel_id) => {
    const userObj = await user.get(email);
    const cart = await cartCollection.findOne({ "_id": userObj.cart_id })
    console.log(cart);
    console.log(travel_id);
    var item = cart.items.find(e => e.travel_id === travel_id);
    console.log(item);
    if (item) {
        if (item.quantity === 1) {
            console.log("Quantity one");
            await cartCollection.updateOne({ "_id": userObj.cart_id },
            {
                $pull: { "items": { "travel_id": travel_id }},
            }, false, true);
        } else {
            await cartCollection.updateOne({ "_id": userObj.cart_id, "items.travel_id": travel_id },
            { $inc: { "items.$.quantity": -1 } } )
        }
    }
}

module.exports = { get, add, remove }