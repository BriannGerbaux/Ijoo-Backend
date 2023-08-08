const client = require('./connect');
const ObjectId = require('mongodb').ObjectId;

const travelCollection = client.db("ijoo-db").collection("travels");

const getById = async (travel_id) => {
    console.log(travel_id);
    const travels = await travelCollection.find({"_id": new ObjectId(travel_id)}).toArray();
    console.log(travels)
    return travels;
}

const get = async (environment, maximumPrice, region, query) => {
    let filterObj = {};

    if (environment) {
        filterObj["environment"] = environment;
    }
    if (maximumPrice) {
        filterObj["price"] = { $lt: maximumPrice };
    }
    if (region) {
        filterObj["region"] = region;
    }
    if (query) {
        filterObj["title"] = RegExp(query, 'i');
    }
    console.log(filterObj);
    return (await travelCollection.find(filterObj).toArray());
}

module.exports = { get, getById }