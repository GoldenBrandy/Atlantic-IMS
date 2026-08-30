import { productoService } from "./productos.service.js";

export const productoController = {
  async getAll(req, res) {
    try {
      const productos = await productoService.getAllProductos();
      res.status(200).json(productos);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const producto = await productoService.getProductoById(req.params.id);
      res.status(200).json(producto);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const producto = await productoService.createProducto(req.body);
      res.status(201).json({
        message: "Producto creado correctamente",
        productoId: producto.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const producto = await productoService.updateProducto(req.params.id, req.body);
      res.status(200).json({
        message: "Producto actualizado correctamente",
        productoId: producto.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },

  async bulkDisable(req, res) {
    try {
      const updated = await productoService.bulkDisable(req.body?.ids);
      res.status(200).json({
        message: "Productos deshabilitados correctamente",
        updated: updated.map((row) => row.id),
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
    }
  },

  async setActive(req, res) {
    try {
      const updated = await productoService.setActive(req.params.id, Boolean(req.body?.isActive));
      res.status(200).json({
        message: "Estado del producto actualizado correctamente",
        status: updated.status,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },
};
