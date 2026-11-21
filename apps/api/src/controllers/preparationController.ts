import type { RequestHandler } from 'express';
import preparationService from '../services/preparationService.js';
import { BeanServiceError } from '../services/beanService.js';
function idOf(value: string) { const id = Number(value); if (!Number.isInteger(id) || id <= 0) throw new BeanServiceError('ID metode seduh tidak valid.', 400); return id; }
function run(handler: (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]) => unknown): RequestHandler { return (req, res, next) => { try { handler(req, res); } catch (e) { next(e); } }; }
const controller = {
  getAll: run((req, res) => res.status(200).json(preparationService.getAll(req.query.includeArchived === 'true'))),
  getById: run((req, res) => res.status(200).json(preparationService.getById(idOf(req.params.id)))),
  create: run((req, res) => res.status(201).json(preparationService.create(req.body ?? {}))),
  update: run((req, res) => res.status(200).json(preparationService.update(idOf(req.params.id), req.body ?? {}))),
  archive: run((req, res) => res.status(200).json(preparationService.archive(idOf(req.params.id)))),
  restore: run((req, res) => res.status(200).json(preparationService.restore(idOf(req.params.id)))),
  getParameters: run((req, res) => res.status(200).json(preparationService.getParameters(idOf(req.params.id)))),
  updateParameters: run((req, res) => res.status(200).json(preparationService.updateParameters(idOf(req.params.id), req.body?.parameters)))
};
export default controller;
