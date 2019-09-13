const jwt = require("jsonwebtoken");
const reduceUser = require("./reducers/reduceUser");
const findUserById = require("./db/User/findUserById");
const tryUpsertUser = require("./db/User/tryUpsertUser");
const findUser = require("./db/User/findUser");

for (let s of ["JWT_SECRET", "JWT_ISSUER"]) {
  if (!process.env[s]) throw new Error(s + " is required in the environment");
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_MAX_AGE = process.env.JWT_MAX_AGE || "14d";

const admin_emails = ["jon@solipsisdev.com", "robin@robinsnestdesigns.com"];

const generateAuthToken = (userId, isAdmin) => {
  return jwt.sign({ uid: userId, a: isAdmin === true }, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: JWT_MAX_AGE,
    issuer: JWT_ISSUER
  });
};

const verifyAuthToken = token => {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ["HS256"],
    issuer: JWT_ISSUER,
    maxAge: JWT_MAX_AGE
  });
};

const register = (obj, args, context) => {
  return tryUpsertUser(args.email, {
    Email: args.email,
    Password: args.password
  }).then(() => signin(obj, args, context));
};

const signin = async (obj, { email, password }, context) => {
  let user = await findUser(email);
  if (!user) {
    throw new Error("User does not exist");
  }
  // TODO upgrade password storage...
  if (password === user.Password) {
    user = reduceUser(user);
    const isAdmin =
      admin_emails.filter(email => user.email === email).length > 0 || false;
    const token = await generateAuthTokenAsync(user.id, isAdmin);
    console.log('Mutation.signin', user, isAdmin, token)
    return {
      token,
      user
    };
  } else {
    return Promise.reject(new Error("Username or password does not match"));
  }
};

const getUserFromToken = async token => {
  const { uid } = await verifyAuthTokenAsync(token);
  const userRow = await findUserById(uid);
  if (!userRow) throw new Error("user does not exist");
  const user = reduceUser(userRow);
  return user;
};

const generateAuthTokenAsync = (userId, isAdmin) =>
  new Promise((resolve, reject) => {
    jwt.sign(
      { uid: userId, a: isAdmin === true },
      JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: JWT_MAX_AGE,
        issuer: JWT_ISSUER
      },
      (err, token) => (err ? reject(err) : resolve(token))
    );
  });

const verifyAuthTokenAsync = token =>
  new Promise((resolve, reject) => {
    jwt.verify(
      token,
      JWT_SECRET,
      {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        maxAge: JWT_MAX_AGE
      },
      (err, payload) => (err ? reject(err) : resolve(payload))
    );
  });

const refreshToken = async (obj, { token }, context) => {
  const payload = await verifyAuthTokenAsync(token);
  const user = await getUserFromToken(token);
  console.log('Mutation.refreshToken', token, payload, user);
  const newToken = await generateAuthTokenAsync(payload.uid, payload.a);
  return {
    user,
    token: newToken
  };
};

module.exports = {
  generateAuthToken,
  generateAuthTokenAsync,
  verifyAuthToken,
  verifyAuthTokenAsync,
  register,
  signin,
  getUserFromToken,
  refreshToken
};
