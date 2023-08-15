require("dotenv").config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cors = require('cors');

const user = require("./database/user");
const travels = require("./database/travels");
const cart = require("./database/cart");

const app = express();
const port = 3000

//app.use(express.json());
app.use(cors())
app.use(express.urlencoded());

app.post('/register', async (req, res, next) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const alreadyExist = await user.exist(email);
        if (!(username && email && password)) {
            res.status(400).send("All input is required");
            return next();
        }
        if (!alreadyExist) {
            //Encrypt user password
            console.log(`${username} ${email} ${password}`)
            const salt = await bcrypt.genSalt(10);
            encryptedPassword = await bcrypt.hash(password, salt);
            await user.create(username, email, encryptedPassword);
            res.status(200).send("User successfully created!");
            return next();
        }
        res.status(400).send("Failed to create user");
        return next();
    } catch (error) {
        return next(error);
    }
});

app.get('/login', async (req, res, next) => {
    try {
        const { email, password } = req.query;

        if (!(email && password)) {
            res.status(400).send("An email and password is required");
            return next();
        }

        const userObj = await user.get(email);

        if (userObj && (await bcrypt.compare(password, userObj.password_hash))) {
            const token = jwt.sign(
            {
                user_id: userObj._id,
                email,
            },
            process.env.TOKEN_KEY,
            {
                expiresIn: "15m",
            });
            res.status(200).json({ token: token });
            return next();
        }
        res.status(400).send("Invalid Credentials");
    } catch (error) {
        console.log(error);
        return next(error);
    }
});

app.get('/travels', async(req, res, next) => {
    try {
        const environment = req.query.environment;
        const maximumPrice = req.query.maximumPrice;
        const region = req.query.region;
        const query = req.query.query;
        console.log(`${environment} ${maximumPrice} ${region} ${query}`);
        const items = await travels.get(environment, maximumPrice, region, query);
        console.log(items);
        res.status(200).json(items);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

app.get('/travels/:id', async(req, res, next) => {
    try {
        if (req.params.id.length == 24) {
            const travelsObj = await travels.getById(req.params.id);
            res.status(200).json(travelsObj);
        } else {
            res.status(400).send("Travel id is invalid");
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

app.get('/user/cart', user.verifyToken, async(req, res, next) => {
    try {
        const userObj = await cart.get(req.user.email);
        res.status(200).json(userObj);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

app.delete('/user/cart/item', user.verifyToken, async(req, res, next) => {
    try {
        await cart.remove(req.user.email, req.body.travel_id);
        res.status(200).send("Successfully removed");
    } catch (error) {
        console.log(error);
        next(error);
    }
})

app.post('/user/cart/item', user.verifyToken, async(req, res, next) => {
    try {
        await cart.add(req.user.email, req.body.travel_id);
        res.status(200).send("Successfully sent");
    } catch (error) {
        console.log(error);
        next(error);
    }
})

app.post("/welcome", user.verifyToken, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});

app.listen(port, () => {
    console.log(`Ijoo app listening at http://localhost:${port}`);
});