import { render, screen, act, fireEvent } from '@testing-library/react';
import App from './App';
import { toDoAPI } from './api/ToDoAPI';
import { of, throwError } from 'rxjs';

// To do:
// Test showing alert when getAll to do call fails
// Test refresh button
// Test marking to do items as completed

describe('the ToDo app component', () => {

  it('should render the footer text', () => {
    act(() => {
      render(<App />)
    });
    const footerElement = screen.getByText(/clearpoint.digital/i)
    expect(footerElement).toBeInTheDocument()
  });

  describe('when the server returns 0 todo items', () => {
    it('should display heading with the correct item count', () => {
      act(() => {
        render(<App />)
      });
      const heading1Element = screen.getByTestId('item-count')
      expect(heading1Element).toHaveTextContent(
        'Showing 0 Item(s)'
      )
    });
  });

  describe('when the server returns some to do items', () => {
    beforeEach(() => {
      const mockToDoList = {
        data: [
          {"id":"wk2Rv1Lpys","description":"easy task"},
          {"id":"sf2sdf2","description":"hard task"},
        ]
      };

      jest.spyOn(toDoAPI, "getAll").mockImplementation(() => of(mockToDoList));

      act(() => {
        render(<App />)
      });
    });

    it('should show the number of displayed to do items', () => {
      const heading1Element = screen.getByTestId('item-count')
      expect(heading1Element).toHaveTextContent(
        'Showing 2 Item(s)'
      )
    });

    it('should render 2 to do items in the table', () => {
      const toDoItems = screen.getAllByTestId('to-do-item')
      expect(toDoItems.length).toBe(2)
    })

  })

  describe('when a to do item is added', () => {
    it('should be added to the to do table', () => {
      jest.spyOn(toDoAPI, "getAll").mockImplementation(() => of({ data: []}));

      jest.spyOn(toDoAPI, "create").mockImplementation(() => of({ data: {
        description: "asdfasdf",
        id: "N7txGZLr8X"
      }}));
      
      act(() => {
        render(<App />);
      });

      act(() => {
        fireEvent.input(screen.getByTestId('to-do-description-input'), { target: { value: 'Climb some rocks' }});
      });

      act(() => {
        fireEvent.click(screen.getByTestId('add-todo-btn'));
      })

      const toDoItems = screen.getAllByTestId('to-do-item');

      expect(toDoItems.length).toBe(1);
    });

    describe('and the api returns an error', () => {
      it('should not add the to do to the to do table', () => {
        jest.spyOn(toDoAPI, "getAll").mockImplementation(() => of({ data: []}));

        jest.spyOn(toDoAPI, "create").mockImplementation(() => throwError(() => new Error('Some http error')));
        
        act(() => {
          render(<App />);
        });
  
        act(() => {
          fireEvent.input(screen.getByTestId('to-do-description-input'), { target: { value: 'Climb some rocks' }});
        });
  
        act(() => {
          fireEvent.click(screen.getByTestId('add-todo-btn'));
        })
  
        const toDoItems = screen.queryAllByTestId('to-do-item');
  
        expect(toDoItems.length).toBe(0);
      });
    });
  });

  describe('when a to do item is deleted', () => {
    beforeEach(() => {
      const mockToDoList = {
        data: [
          {"id":"wk2Rv1Lpys","description":"easy task"},
        ]
      };

      jest.spyOn(toDoAPI, "getAll").mockImplementation(() => of(mockToDoList));

      act(() => {
        render(<App />);
      });
    });

    it('should be removed from the to do table', () => {
      jest.spyOn(toDoAPI, "delete").mockImplementation(() => of({}));
      const deleteButton = screen.getByTestId('delete-to-do-btn');
      expect(screen.queryAllByTestId('to-do-item').length).toBe(1);

      act(() => {
        fireEvent.click(deleteButton);
      });
      
      expect(screen.queryAllByTestId('to-do-item').length).toBe(0);
    });

    describe('and the api throws an error', () => {
      it('should not remove the to do from the table', () => {
        jest.spyOn(toDoAPI, "delete").mockImplementation(() => throwError(() => new Error('some http error')));
        const deleteButton = screen.getByTestId('delete-to-do-btn');
        expect(screen.queryAllByTestId('to-do-item').length).toBe(1);

        act(() => {
          fireEvent.click(deleteButton);
        });

        expect(screen.queryAllByTestId('to-do-item').length).toBe(1);
      });

      it('should display an alert', () => {
        jest.spyOn(toDoAPI, "delete").mockImplementation(() => throwError(() => new Error('some http error')));
        const deleteButton = screen.getByTestId('delete-to-do-btn');

        act(() => {
          fireEvent.click(deleteButton);
        });

        expect(screen.queryByText(/Could not delete todo. Please try again./i)).not.toBe(null);
      });
    })
  });
});
