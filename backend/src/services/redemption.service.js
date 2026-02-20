// src/services/redemption.service.js
const { Op } = require("sequelize");
const { HttpError } = require("../utils/httpError");
const models = require("../models");
const { sequelize } = require("../config/db");

const pointsService = require("./points.service");

console.log("[redemption.service] loaded from:", __filename);

function isExpired(expiresAt) {
  if (!expiresAt) return false;
  return Date.now() > new Date(expiresAt).getTime();
}

async function listRedemptions({ businessId, status, q, includeCancelled }) {
  const where = { businessId };

  if (status) where.status = status;
  if (!includeCancelled && !status) {
    where.status = { [Op.ne]: "cancelled" };
  }

  if (q && q.trim()) {
    where[Op.or] = [
      { redeemCode: { [Op.iLike]: `%${q.trim()}%` } },
      { rewardNameSnapshot: { [Op.iLike]: `%${q.trim()}%` } },
    ];
  }

  const items = await models.RewardRedemption.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });

  return items;
}

async function consumeRedemption({
  businessId,
  redeemCode,
  operatorUserId,
  branchId,
}) {
  console.log("llego al consumeRedemption");
  if (!redeemCode) {
    throw new HttpError(400, "redeemCode is required.", "REDEEM_CODE_REQUIRED");
  }

  return await sequelize.transaction(async (t) => {
    const redemption = await models.RewardRedemption.findOne({
      where: { businessId, redeemCode },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!redemption) {
      throw new HttpError(404, "Redemption not found.", "REDEMPTION_NOT_FOUND");
    }

    // If issued but expired -> auto cancel + refund
    if (redemption.status === "issued" && isExpired(redemption.expiresAt)) {
      const autoCancelled = await cancelInternal({
        businessId,
        redemption,
        operatorUserId: null,
        branchId: branchId ?? null,
        reasonCode: "expired_7d",
        reasonText: null,
        cancelledSource: "auto",
        transaction: t,
      });

      return {
        ok: false,
        message: "Código vencido. Canje anulado y puntos devueltos.",
        item: autoCancelled,
      };
    }

    if (redemption.status === "redeemed") {
      throw new HttpError(
        409,
        "Redemption already redeemed.",
        "REDEMPTION_ALREADY_REDEEMED",
      );
    }
    if (redemption.status === "cancelled") {
      throw new HttpError(
        409,
        "Redemption already cancelled.",
        "REDEMPTION_ALREADY_CANCELLED",
      );
    }
    if (redemption.status !== "issued") {
      throw new HttpError(
        409,
        "Invalid redemption status.",
        "REDEMPTION_INVALID_STATUS",
      );
    }

    await redemption.update(
      {
        status: "redeemed",
        redeemedAt: new Date(),
        redeemedByUserId: operatorUserId ?? null,
        branchId: branchId ?? redemption.branchId ?? null,
      },
      { transaction: t },
    );

    return {
      ok: true,
      message: "Canje confirmado.",
      item: redemption,
    };
  });
}

async function cancelRedemption({
  businessId,
  redeemCode,
  operatorUserId,
  branchId,
  reasonCode,
  reasonText,
}) {
  if (!redeemCode) {
    throw new HttpError(400, "redeemCode is required.", "REDEEM_CODE_REQUIRED");
  }

  return await sequelize.transaction(async (t) => {
    const redemption = await models.RewardRedemption.findOne({
      where: { businessId, redeemCode },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!redemption) {
      throw new HttpError(404, "Redemption not found.", "REDEMPTION_NOT_FOUND");
    }

    if (redemption.status === "redeemed") {
      throw new HttpError(
        409,
        "Cannot cancel a redeemed redemption.",
        "REDEMPTION_ALREADY_REDEEMED",
      );
    }
    if (redemption.status === "cancelled") {
      throw new HttpError(
        409,
        "Redemption already cancelled.",
        "REDEMPTION_ALREADY_CANCELLED",
      );
    }
    if (redemption.status !== "issued") {
      throw new HttpError(
        409,
        "Invalid redemption status.",
        "REDEMPTION_INVALID_STATUS",
      );
    }

    const cancelled = await cancelInternal({
      businessId,
      redemption,
      operatorUserId,
      branchId: branchId ?? null,
      reasonCode,
      reasonText,
      cancelledSource: "manual",
      transaction: t,
    });

    return {
      ok: true,
      message: "Canje anulado. Puntos devueltos.",
      item: cancelled,
    };
  });
}

/**
 * Internal cancel:
 * - update redemption to cancelled
 * - create refund points transaction (idempotent)
 *
 * NOTE: pointsService has its own transaction (MVP). If later we want a single
 * transaction for everything, we can extend pointsService to accept an external `transaction`.
 */
async function cancelInternal({
  businessId,
  redemption,
  operatorUserId,
  branchId,
  reasonCode,
  reasonText,
  cancelledSource,
  transaction,
}) {
  // Update redemption (this is usually called inside a DB transaction with lock)
  await redemption.update(
    {
      status: "cancelled",
      cancelledAt: new Date(),
      cancelledByUserId: operatorUserId ?? null,
      cancelledSource,
      cancelReasonCode: reasonCode,
      cancelReasonText: reasonCode === "other" ? reasonText : null,
      branchId: branchId ?? redemption.branchId ?? null,
    },
    { transaction },
  );

  // Refund points (idempotent via idempotencyKey unique)
  const refundKey = `refund-${redemption.id}`;

  await pointsService.createTransaction(
    businessId,
    operatorUserId ?? null,
    {
      membershipId: redemption.customerMembershipId,
      type: "refund",
      points: Math.abs(redemption.pointsCostSnapshot),
      note:
        cancelledSource === "auto"
          ? "Devolución por canje vencido (7 días)"
          : `Devolución por anulación de canje: ${humanReason(reasonCode, reasonText)}`,
      source: cancelledSource === "auto" ? "system" : "manual",
      branchId: branchId ?? null,
      idempotencyKey: refundKey,
      relatedRedemptionId: redemption.id,
    },
    { transaction },
  );

  return redemption;
}

function humanReason(reasonCode, reasonText) {
  const map = {
    customer_changed_mind: "Cliente cambió de opinión",
    operator_error: "Error del operador",
    reward_unavailable: "Producto no disponible",
    system_issue: "Problema técnico del sistema",
    wrong_code: "Código ingresado por error",
    other: reasonText || "Otro",
    expired_7d: "Vencido (7 días)",
  };
  return map[reasonCode] || "Otro";
}

module.exports = {
  listRedemptions,
  consumeRedemption,
  cancelRedemption,
};
