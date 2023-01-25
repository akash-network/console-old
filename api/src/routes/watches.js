const debug = (message) => (result) =>
  console.log(message) || result

const getProp = (propName) => (context) =>
  new Promise((resolve, reject) =>
    context.hasOwnProperty(propName)
      ? resolve(context.prop)
      : reject(`Property ${propName} does not exist`)
  );

const map = (fn) =>
  (list) => list.map(fn)

const waitAll = (promises) =>
  Promise.all(promises)

getUser('bob')
  .then(debug("what is happening here"))
  .then(
    getProp('friends'), // or
    handleRequestError
  )
  .then(
    map(getUser), // or
    handleMissingProp
  )
  .then(waitAll)
  .then(
    handleFriends, // or
    handleNoFriends
  );