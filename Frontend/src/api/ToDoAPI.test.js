import Axios from "axios-observable";
import { of } from "rxjs";
import { toDoAPI } from "./ToDoAPI";

describe('the toDoAPI', () => {
  describe('the getAll function', () => {
    it('should call Axios.get', (done) => {
      jest.spyOn(Axios, 'get').mockImplementation(() => of({}));
      toDoAPI.getAll().subscribe(() => {
        expect(Axios.get).toHaveBeenCalledWith('/api/todoItems');
        done();
      });
    });
  });

  describe('the create function', () => {
    it('should call Axios.post', (done) => {
      jest.spyOn(Axios, 'post').mockImplementation(() => of({}));
      toDoAPI.create('something fun').subscribe(() => {
        expect(Axios.post).toHaveBeenCalledWith('/api/todoItems', { description: 'something fun' });
        done();
      });
    });
  });

  describe('the update function', () => {
    it('should call Axios.update', (done) => {
      jest.spyOn(Axios, 'put').mockImplementation(() => of({}));
      const item = { description: 'something nice', id: '123abc'};
      toDoAPI.update(item).subscribe(() => {
        expect(Axios.put).toHaveBeenCalledWith(`/api/todoItems/${item.id}`, item);
        done();
      });
    });
  });

  describe('the delete function', () => {
    it('should call Axios.update', (done) => {
      jest.spyOn(Axios, 'delete').mockImplementation(() => of({}));
      toDoAPI.delete('123abc').subscribe(() => {
        expect(Axios.delete).toHaveBeenCalledWith('/api/todoItems/123abc');
        done();
      });
    });
  });
});