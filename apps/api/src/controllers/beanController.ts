import type { RequestHandler } from 'express';
import type { Bean } from '@brobean/shared';
import beanService, { BeanServiceError } from '../services/beanService.js';

function getBeanId(value: string): number {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new BeanServiceError('ID kopi tidak valid.', 400);
  }

  return id;
}

function getRequestBody(body: unknown): Partial<Bean> {
  if (
    typeof body !== 'object' ||
    body === null ||
    Array.isArray(body)
  ) {
    throw new BeanServiceError('Format data request tidak valid.', 400);
  }

  return body as Partial<Bean>;
}

const getAll: RequestHandler = (_req, res, next) => {
  try {
    res.status(200).json(beanService.getAll());
  } catch (error) {
    next(error);
  }
};

const getById: RequestHandler = (req, res, next) => {
  try {
    const id = getBeanId(req.params.id);
    res.status(200).json(beanService.getById(id));
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    const bean = beanService.create(getRequestBody(req.body));
    res.status(201).json(bean);
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = (req, res, next) => {
  try {
    const id = getBeanId(req.params.id);
    const bean = beanService.update(id, getRequestBody(req.body));

    res.status(200).json(bean);
  } catch (error) {
    next(error);
  }
};

const archive: RequestHandler = (req, res, next) => {
  try {
    const id = getBeanId(req.params.id);
    const bean = beanService.archive(id);

    res.status(200).json(bean);
  } catch (error) {
    next(error);
  }
};

const restore: RequestHandler = (req, res, next) => {
  try {
    const id = getBeanId(req.params.id);
    const bean = beanService.restore(id);

    res.status(200).json(bean);
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = (req, res, next) => {
  try {
    const id = getBeanId(req.params.id);
    beanService.delete(id);

    res.status(200).json({ message: 'Terhapus' });
  } catch (error) {
    next(error);
  }
};

const beanController = {
  getAll,
  getById,
  create,
  update,
  archive,
  restore,
  delete: remove
};

export default beanController;
