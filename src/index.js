const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
	const { username } = request.headers;
	const user = users.find(user => user.username === username);

	if (!user)
		return response.status(404).send({ error: 'User does not exist' })

	request.user = user;

	return next();
}

app.post('/users', (request, response) => {
	const { name, username } = request.body;
	const verifyUserExist = users.some(user => user.username === username)

	if (verifyUserExist)
		return response.status(400).send({ error: 'User already exists' });

	const user = {
		id: uuidv4(),
		name,
		username,
		todos: []
	}

	users.push(user);

	return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
	const { user } = request;
	const todos = user.todos;
	return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
	const { title, deadline } = request.body;
	const { user } = request;
	const todo = {
		id: uuidv4(),
		title,
		deadline: new Date(deadline),
		done: false,
		created_at: new Date()
	}
	user.todos.push(todo);

	return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { title, deadline } = request.body;
	const { id } = request.params;

	const { user } = request;

	const todo = user.todos.find(todo => todo.id === id);
	if (!todo)
		return response.status(404).send({ error: 'todo does not exist' })
	const updatedTodo = {
		...todo,
		title,
		deadline: new Date(deadline)
	}

	const index = user.todos.findIndex(todo => todo.id === id);

	user.todos[index] = updatedTodo

	return response.json(updatedTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
	const { id } = request.params;

	const { user } = request;

	const todo = user.todos.find(todo => todo.id === id);
	if (!todo)
		return response.status(404).send({ error: 'todo does not exist' });
	const updatedTodo = {
		...todo,
		done: true
	};

	const index = user.todos.findIndex(todo => todo.id === id);

	user.todos[index] = updatedTodo;

	return response.json(updatedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { id } = request.params;

	const { user } = request;

	const todo = user.todos.find(todo => todo.id === id);
	if (!todo)
		return response.status(404).send({ error: 'todo does not exist' });

	user.todos.splice(todo, 1);

	return response.status(204).send();
});

module.exports = app;