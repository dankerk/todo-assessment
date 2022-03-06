import { Axios } from "axios-observable";

const baseUrl = '/api/todoItems'

export const toDoAPI = {
  getAll: () => Axios.get(baseUrl),
  create: (description) => Axios.post(baseUrl, { description }),
  update: (item) => Axios.put(`${baseUrl}/${item.id}`, item),
  delete: (id) => Axios.delete(`${baseUrl}/${id}`),
}