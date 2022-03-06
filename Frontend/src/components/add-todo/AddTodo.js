import { useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Stack } from "react-bootstrap"
import { toDoAPI } from "../../api/ToDoAPI";

const initialState = {
  description: '',
  error: undefined
};

const AddTodo = (props) => {
  const [description, setDescription] = useState(initialState.description);
  const [error, setError] = useState(initialState.error);

  function handleAdd() {
    if (!description.length) {
      return setError('Please enter a description.');
    }

    toDoAPI
      .create(description)
      .subscribe({
        next: (response) => {
          handleClear();
          props.onAddToDo(response.data);
        },
        error: () => setError('Apologies, something went wrong. Please try again.')
      });
  }

  function handleClear() {
    setDescription(initialState.description);
  }

  function clearError() {
    setError(initialState.error)
  }

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  }

  function getAlert(message) {
    return (
      <Alert variant="warning" role="alert">
        <div className="mb-3">
          { message }
        </div>
        <Button variant="primary" onClick={() => clearError()}>
          Ok
        </Button>
      </Alert>
    )
  }

  function getFormButtons() {
    return (
      <Form.Group as={Row} className="mb-3 offset-md-2" controlId="formAddTodoItem">
        <Stack direction="horizontal" gap={2}>
          <Button variant="primary" onClick={() => handleAdd()} data-testid="add-todo-btn">
            Add Item
          </Button>
          <Button variant="secondary" onClick={() => handleClear()}>
            Clear
          </Button>
        </Stack>
      </Form.Group>
    )
  }

  return (
    <Container>
      <h1>Add Item</h1>
      <Form.Group as={Row} className="mb-3" controlId="formAddTodoItem">
        <Form.Label column sm="2">
          Description
        </Form.Label>
        <Col md="6">
          <Form.Control
            type="text"
            placeholder="Enter description..."
            value={description}
            onChange={handleDescriptionChange}
            required
            data-testid="to-do-description-input"
          />
        </Col>
      </Form.Group>

      { (error && getAlert(error)) || getFormButtons()}
     
    </Container>
  )
}

export default AddTodo