import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const protoObject = protoLoader.loadSync('./proto/users.proto');
const UsersDefinition = grpc.loadPackageDefinition(protoObject);

const users = [
  { id: 1, name: 'Rodrigo', lastName: 'Tamura', age: 36, client: true },
  { id: 2, name: 'Mateus', lastName: 'Candido', age: 20, client: false },
];

// RPCs
function List (_, callback) {
  return callback(null, { users })
}

function GetById ({ request: { id }, callback }) {
  const user = users.find((user) => user.id === id)
  if (!user) return callback(new Error('Not found'), null);
  return callback(null, { user });
}

function Create ({ request: { id, name, lastName, age, client }, callback } ) {
  if (!id || !name) 
    return callback(new Error('Id and Name required'), null);
  const user = { id, name, lastName, age, client }
  users.push(user);
  return callback(null, { user })
}

// Server starting
const server = new grpc.Server();
server.addService(UsersDefinition.UserService.service, { List, GetById, Create });

server.bindAsync(
  '0.0.0.0:50051', 
  grpc.ServerCredentials.createInsecure(), 
  () => server.start(),
);