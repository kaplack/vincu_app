// backend/src/controllers/publicLoyalty.controller.js
const publicLoyaltyService = require("../services/publicLoyalty.service");
const { sequelize } = require("../config/db");
const customerService = require("../services/customer.service");
const { HttpError } = require("../utils/httpError"); // usa tu ruta real

async function joinLite(req, res, next) {
  try {
    const { slug } = req.params;
    const { phone, firstName } = req.body;

    const { Business } = sequelize.models;

    const business = await Business.findOne({ where: { slug } });
    if (!business) {
      throw new HttpError(404, "Business not found.", "BUSINESS_NOT_FOUND");
    }
    // si usas negocio principal vs sucursal (parentId)
    if (business.parentId) {
      throw new HttpError(400, "Invalid business.", "BIZ_NOT_PRINCIPAL");
    }

    const result = await customerService.createCustomer({
      businessId: business.id,
      phone,
      firstName: firstName?.trim() || null,
    });

    // Puedes devolver también info del business (útil para el landing)
    return res.status(201).json({
      business: {
        id: business.id,
        commercialName: business.commercialName,
        slug: business.slug,
      },
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

async function getByPublicToken(req, res, next) {
  try {
    const result = await publicLoyaltyService.getByPublicToken(
      req.params.token,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  joinLite,

  getByPublicToken,
};
