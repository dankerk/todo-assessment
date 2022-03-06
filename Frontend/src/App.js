import './App.css'
import { Alert, Button, Container, Row, Col, Table } from 'react-bootstrap'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import Header from './components/header/Header'
import AddTodo from './components/add-todo/AddTodo'
import { toDoAPI } from './api/ToDoAPI'
import { Subject, takeUntil } from 'rxjs'

const initialState = {
  items: [],
  error: undefined,
}

// Remarks
// - Coming from Angular I love working with Observables, although I believe they're not very common in the react world so apologies if that's confusing.

// To do
// There are still some things to improve.
// Some of these things are:
// - Migrate to TypeScript
// - Move to do table into its' own component
// - Move to do item into it's own component
// - Move to alert into it's own component
// - Move text strings to separate file
// - Implement a better way to ensure all async (fetch) operations are cancelled on unmount
//   Currently it's required to disable an eslint rule, which I don't like to do,
//   a better way to do this: create a reusable higher order component that passes an abort signal to the component.

const App = () => {
  const [items, setItems] = useState(initialState.items);
  const [error, setError] = useState(initialState.error);

  const $unmount = useRef(new Subject());

  const getItems = useCallback(() => {
    return toDoAPI
      .getAll()
      .pipe(takeUntil($unmount.current))
      .subscribe({
        next: (response) => {
          setItems(response.data)
        },
        error: () => {
          setError('Apologies, your todos could not be loaded or refreshed. Please refresh to try again.');
        }
      })
  }, []);

  useEffect(() => {
    getItems();

    // I don't like to do this, but does the job for now.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => $unmount.current.next();
  }, [getItems])

  function handleAddTodo(item) {
    setItems([...items, item])
  }

  function handleMarkAsComplete(item) {
    toDoAPI
      .update({ ...item, isComplete: true })
      .pipe(takeUntil($unmount.current))
      .subscribe({
        next: () => { 
          const updatedItems = items.map((stateItem) => stateItem.id === item.id ? { ...stateItem, isComplete: true } : stateItem);
          setItems(updatedItems);
        }
      });
  }
  
  function handleDelete(id) {
    toDoAPI.delete(id)
      .pipe(takeUntil($unmount.current))
      .subscribe({
        next: () => {
          const updatedItems = items.filter((item) => item.id !== id);
          setItems(updatedItems);
        },
        error: () => setError('Could not delete todo. Please try again.')
      });
  }

  function getAlert(message) {
    return (
      <Alert variant="warning" role="alert">
        <div className="mb-3">
          { message }
        </div>
      </Alert>
    )
  }

  function getToDoItem(item) {
    return (
      <tr key={item.id} className={item.isComplete ? 'complete' : ''} data-testid="to-do-item">
        <td>{item.id}</td>
        <td>{item.description}</td>
        <td>
          { !item.isComplete ? getMarkAsCompleteButton(item) : '' }
        </td>
        <td>
          <Button variant="warning" size="sm" onClick={() => handleDelete(item.id)} data-testid="delete-to-do-btn">
            Delete
          </Button>
        </td>
      </tr>
    )
  }

  const renderTodoItemsContent = () => {
    return (
      <>
        <h1 data-testid="item-count">
          Showing {items.length} Item(s){' '}
          <Button variant="primary" className="pull-right" onClick={getItems}>
            Refresh
          </Button>
        </h1>

        { (error && getAlert(error)) }

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Id</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(getToDoItem)}
          </tbody>
        </Table>
      </>
    )
  }

  function getMarkAsCompleteButton(item) {
    return (
      <Button variant="warning" size="sm" onClick={() => handleMarkAsComplete(item)}>
        Mark as completed
      </Button>
    )
  }

  return (
    <div className="App">
      <Container>
        <Header></Header>
        <Row>
          <Col>
            <AddTodo onAddToDo={handleAddTodo}></AddTodo>
          </Col>
        </Row>
        <br />
        <Row>
          <Col>{renderTodoItemsContent()}</Col>
        </Row>
      </Container>
      <footer className="page-footer font-small teal pt-4">
        <div className="footer-copyright text-center py-3">
          © 2021 Copyright:
          <a href="https://clearpoint.digital" target="_blank" rel="noreferrer">
            clearpoint.digital
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
