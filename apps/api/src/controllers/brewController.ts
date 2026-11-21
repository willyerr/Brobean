import type { RequestHandler } from 'express';
import brewService from '../services/brewService.js';
import { BeanServiceError } from '../services/beanService.js';
function idOf(value: string) { const id = Number(value); if (!Number.isInteger(id) || id <= 0) throw new BeanServiceError('ID Brew Log tidak valid.', 400); return id; }
function run(handler: (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]) => unknown): RequestHandler { return (req, res, next) => { try { handler(req, res); } catch (e) { next(e); } }; }
const controller = {
  getAll: run((req, res) => res.status(200).json(brewService.getAll({ beanId: req.query.beanId, preparationId: req.query.preparationId }))),
  getById: run((req, res) => res.status(200).json(brewService.getById(idOf(req.params.id)))),
  create: run((req, res) => res.status(201).json(brewService.create(req.body ?? {}))),
  update: run((req, res) => res.status(200).json(brewService.update(idOf(req.params.id), req.body ?? {}))),
  remove: run((req, res) => { brewService.delete(idOf(req.params.id)); res.status(200).json({ message: 'Brew Log berhasil dihapus.' }); })
};
export default controller;
