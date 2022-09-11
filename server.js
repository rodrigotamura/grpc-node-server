const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const protoObject = protoLoader.loadSync('./proto/users.proto');
const UsersDefinition = grpc.loadPackageDefinition(protoObject);

const users = [
  { id: 1, name: 'Rodrigo', lastName: 'Tamura', age: 36, client: true },
  { id: 2, name: 'Mateus', lastName: 'Candido', age: 20, client: false },
];

// RPCs
async function List (_, callback) {
  return callback(null, { users });
}

async function GetById ({request: {id}}, callback) {
  const user = users.find((user) => user.id === id)
  console.table(user)
  if (!user) return callback(new Error('Not found'), null);
  return callback(null, { user });
}

async function Create ({request: { user: { id, name, lastName, age, client } }} , callback  ) {
  if (!id || !name) 
    return callback(new Error('Id and Name required'), null);
  const user = { id, name, lastName, age, client }
  users.push(user);
  return callback(null, { user });
}

// Server starting
const server = new grpc.Server();
server.addService(UsersDefinition.UserService.service, { List, GetById, Create });

server.bindAsync(
  '0.0.0.0:50053', 
  grpc.ServerCredentials.createInsecure(), 
  () => {
    server.start();
    console.log('Server started');
  }
);