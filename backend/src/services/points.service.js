// backend/src/services/points.service.js
const { sequelize } = require("../config/db");
const { HttpError } = require("../utils/httpError");
const walletCardService = require("./walletCard.service");

/**
 * Confirma que la membership existe y pertenece al business actual.
 * Retorna la fila de membership (mínimo con pointsBalance).
 */
async function ensureMembership(businessId, membershipId, options = {}) {
  const CustomerMembership = sequelize.models.CustomerMembership;

  if (!businessId) {
    throw new HttpError(400, "Invalid business.", "NO_BUSINESS");
  }

  const membership = await CustomerMembership.findOne({
    where: { id: membershipId, businessId },
    attributes: ["id", "pointsBalance", "businessId", "status"],
    ...options,
  });

  if (!membership) {
    throw new HttpError(404, "Not found.", "NOT_FOUND");
  }

  return membership;
}

/**
 * Crea una transacción de puntos y actualiza el saldo de la membership.
 *
 * - operatorUserId: puede ser null (Sistema)
 * - type: earn | redeem | refund | adjust
 * - points: int != 0 (positivo o negativo)
 *
 * Body: {
 *   membershipId,
 *   type,
 *   points,
 *   note,
 *   source,            // manual | qr | system
 *   branchId,
 *   idempotencyKey,
 *   relatedRedemptionId
 * }
 */
async function createTransaction(
  businessId,
  operatorUserId,
  body,
  options = {},
) {
  const PointsTransaction = sequelize.models.PointsTransaction;
  const CustomerMembership = sequelize.models.CustomerMembership;

  const {
    membershipId,
    type,
    points,
    note = null,
    source = "manual",
    branchId = null,
    idempotencyKey = null,
    relatedRedemptionId = null,
  } = body;

  const externalTx = options.transaction || null;

  // operatorUserId ahora es opcional (null = system)
  // pero si source es manual/qr, normalmente debería venir un operador.
  if ((source === "manual" || source === "qr") && !operatorUserId) {
    throw new HttpError(401, "Unauthorized.", "AUTH_REQUIRED");
  }

  if (!membershipId) {
    throw new HttpError(400, "membershipId is required.", "VALIDATION_ERROR");
  }

  if (!["earn", "redeem", "refund", "adjust"].includes(type)) {
    throw new HttpError(400, "Invalid type.", "VALIDATION_ERROR");
  }

  if (!Number.isInteger(points) || points === 0) {
    throw new HttpError(400, "Invalid points.", "VALIDATION_ERROR");
  }

  // En VINCU: earn/redeem siempre requieren branchId (para estadísticas por sucursal)
  const needsBranch =
    (type === "earn" || type === "redeem") && source !== "system";
  if (needsBranch && !branchId) {
    throw new HttpError(400, "branchId is required.", "BRANCH_REQUIRED");
  }

  // 1) Confirmar pertenencia al negocio (fuera para error rápido)
  //await ensureMembership(businessId, membershipId);

  // 2) Crear TX + actualizar balance en una transacción DB

  const run = async (t) => {
    const membership = await ensureMembership(businessId, membershipId, {
      transaction: t,
      lock: t?.LOCK?.UPDATE,
    });

    const item = await PointsTransaction.create(
      {
        customerMembershipId: membership.id,
        type,
        points,
        note,
        source,
        branchId,
        idempotencyKey,
        operatorUserId: operatorUserId ?? null,
        relatedRedemptionId,
      },
      { transaction: t },
    );

    const newBalance = (membership.pointsBalance || 0) + points;

    if (newBalance < 0) {
      throw new HttpError(400, "Insufficient points.", "INSUFFICIENT_POINTS");
    }

    await CustomerMembership.update(
      { pointsBalance: newBalance },
      { where: { id: membership.id }, transaction: t },
    );

    return { item, pointsBalance: newBalance };
  };

  try {
    const result = externalTx
      ? await run(externalTx)
      : await sequelize.transaction(async (t) => run(t));

    // 🔥 Sync Wallet fuera de la transacción DB
    // (no bloquea la consistencia del saldo en tu DB)
    try {
      await walletCardService.syncWalletPoints({
        membershipId,
        businessId,
        pointsBalance: result.pointsBalance,
      });
    } catch (e) {
      // No rompas el flujo de POS por un problema externo.
      // Solo loguea para debug.
      console.warn("Wallet sync failed:", e?.message || e);
    }

    return result;
  } catch (err) {
    // Si se duplica idempotencyKey (unique index membershipId+idempotencyKey),
    // devolvemos la tx existente (comportamiento idempotente real).
    // Sequelize/Postgres: err.name = 'SequelizeUniqueConstraintError'
    if (err?.name === "SequelizeUniqueConstraintError" && idempotencyKey) {
      const existing = await PointsTransaction.findOne({
        where: { customerMembershipId: membershipId, idempotencyKey },
        transaction: externalTx || undefined,
      });

      if (existing) {
        const membership = await ensureMembership(businessId, membershipId, {
          transaction: externalTx || undefined,
        });
        try {
          await walletCardService.syncWalletPoints({
            membershipId,
            businessId,
            pointsBalance: membership.pointsBalance || 0,
          });
        } catch (e) {
          console.warn("Wallet sync failed:", e?.message || e);
        }

        return { item: existing, pointsBalance: membership.pointsBalance || 0 };
      }
    }
    throw err;
  }
}

module.exports = {
  createTransaction,
};
