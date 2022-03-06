import { act, fireEvent, render, screen } from "@testing-library/react"
import { of, throwError } from "rxjs"
import { toDoAPI } from "../../api/ToDoAPI"
import AddTodo from "./AddTodo"

// To do:
// Add test to check the removal of the alert after clicking the Ok button

const AddToDoComponent = ({ handleAddTodo }) => (
  <AddTodo onAddToDo={handleAddTodo}></AddTodo>
)

describe('the AddToDo component', () => {
  describe('when adding a to do', () => {
    it('should display an alert when the description is empty', () => {
      act(() => {
        render(<AddToDoComponent/>)
      });

      act(() => {
        fireEvent.click(screen.getByTestId('add-todo-btn'));
      });

      const alert = screen.getByRole('alert');

      expect(alert.textContent).toBe('Please enter a description.Ok')
    });

    it('should call the handleAddTodo callback', () => {
      const toDoItem = {
        description: "asdfasdf",
        id: "N7txGZLr8X"
      };

      jest.spyOn(toDoAPI, "create").mockImplementation(() => of({ data: toDoItem }));

      const handleToDoSpy = jest.fn();

      act(() => {
        render(<AddToDoComponent handleAddTodo={handleToDoSpy} />)
      });
      
      act(() => {
        fireEvent.input(screen.getByTestId('to-do-description-input'), { target: { value: 'Climb some rocks' }});
      });

      act(() => {
        fireEvent.click(screen.getByTestId('add-todo-btn'));
      });

      expect(handleToDoSpy).toHaveBeenCalledWith(toDoItem)
    });

    describe('and the api returns an error', () => {
      const handleToDoSpy = jest.fn();

      beforeEach(() => {
        jest.spyOn(toDoAPI, "create").mockImplementation(() => throwError(() => new Error('some http error')));
  
        act(() => {
          render(<AddToDoComponent handleAddTodo={handleToDoSpy} />)
        });
        
        act(() => {
          fireEvent.input(screen.getByTestId('to-do-description-input'), { target: { value: 'Climb some rocks' }});
        });
  
        act(() => {
          fireEvent.click(screen.getByTestId('add-todo-btn'));
        });
      })

      it('should not call the callback handle', () => {  
        expect(handleToDoSpy).not.toHaveBeenCalled();
      });
      
      it('should diplay an alert', () => {
        const alert = screen.getByRole('alert');

        expect(alert.textContent).toBe('Apologies, something went wrong. Please try again.Ok')
      });
    });
  });
});