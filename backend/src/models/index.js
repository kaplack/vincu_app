// backend/src/models/index.js
const { initUserModel } = require("./User");
const { initBusinessModel } = require("./Business");
const { initBusinessUserModel } = require("./BusinessUser");
const { initInvitationModel } = require("./Invitation");
const { initWalletCardConfigModel } = require("./WalletCardConfig");
const { initCustomerModel } = require("./Customer");
const { initCustomerMembershipModel } = require("./CustomerMembership");
const { initPointsTransactionModel } = require("./PointsTransaction");

// NEW
const { initRewardModel } = require("./Reward");
const { initRewardRedemptionModel } = require("./RewardRedemption");

function registerModels(sequelize) {
  const User = initUserModel(sequelize);
  const Business = initBusinessModel(sequelize);
  const BusinessUser = initBusinessUserModel(sequelize);
  const WalletCardConfig = initWalletCardConfigModel(sequelize);
  const Invitation = initInvitationModel(sequelize);
  const Customer = initCustomerModel(sequelize);
  const CustomerMembership = initCustomerMembershipModel(sequelize);
  const PointsTransaction = initPointsTransactionModel(sequelize);

  // NEW
  const Reward = initRewardModel(sequelize);
  const RewardRedemption = initRewardRedemptionModel(sequelize);

  // Associations
  User.belongsToMany(Business, {
    through: BusinessUser,
    as: "businesses",
    foreignKey: "userId",
  });
  Business.belongsToMany(User, {
    through: BusinessUser,
    as: "users",
    foreignKey: "businessId",
  });

  BusinessUser.belongsTo(User, { as: "user", foreignKey: "userId" });
  BusinessUser.belongsTo(Business, {
    as: "business",
    foreignKey: "businessId",
  });
  BusinessUser.belongsTo(User, {
    as: "invitedBy",
    foreignKey: "invitedByUserId",
  });

  Invitation.belongsTo(Business, { as: "business", foreignKey: "businessId" });
  Invitation.belongsTo(User, {
    as: "invitedBy",
    foreignKey: "invitedByUserId",
  });
  Invitation.belongsTo(User, {
    as: "acceptedBy",
    foreignKey: "acceptedByUserId",
  });

  // Wallet Card Config belongs to Business
  Business.hasOne(WalletCardConfig, {
    as: "walletCardConfig",
    foreignKey: "businessId",
  });
  WalletCardConfig.belongsTo(Business, {
    as: "business",
    foreignKey: "businessId",
  });

  // --- Loyalty (public customers) ---
  Customer.hasMany(CustomerMembership, {
    as: "memberships",
    foreignKey: "customerId",
  });
  CustomerMembership.belongsTo(Customer, {
    as: "customer",
    foreignKey: "customerId",
  });

  // IMPORTANT: businessId points to PRINCIPAL business
  Business.hasMany(CustomerMembership, {
    as: "customerMemberships",
    foreignKey: "businessId",
  });
  CustomerMembership.belongsTo(Business, {
    as: "business",
    foreignKey: "businessId",
  });

  CustomerMembership.hasMany(PointsTransaction, {
    as: "transactions",
    foreignKey: "customerMembershipId",
  });
  PointsTransaction.belongsTo(CustomerMembership, {
    as: "membership",
    foreignKey: "customerMembershipId",
  });

  // PointsTransaction -> User (operator)
  PointsTransaction.belongsTo(User, {
    foreignKey: "operatorUserId",
    as: "operator",
  });
  User.hasMany(PointsTransaction, {
    foreignKey: "operatorUserId",
    as: "pointsTransactions",
  });

  // PointsTransaction -> Business (branch)
  PointsTransaction.belongsTo(Business, {
    foreignKey: "branchId",
    as: "branch",
  });
  Business.hasMany(PointsTransaction, {
    foreignKey: "branchId",
    as: "branchTransactions",
  });

  // --- Rewards ---
  Business.hasMany(Reward, { as: "rewards", foreignKey: "businessId" });
  Reward.belongsTo(Business, { as: "business", foreignKey: "businessId" });

  Reward.hasMany(RewardRedemption, {
    as: "redemptions",
    foreignKey: "rewardId",
  });
  RewardRedemption.belongsTo(Reward, { as: "reward", foreignKey: "rewardId" });

  CustomerMembership.hasMany(RewardRedemption, {
    as: "redemptions",
    foreignKey: "customerMembershipId",
  });
  RewardRedemption.belongsTo(CustomerMembership, {
    as: "membership",
    foreignKey: "customerMembershipId",
  });

  // Redemption audit -> User
  RewardRedemption.belongsTo(User, {
    as: "redeemedBy",
    foreignKey: "redeemedByUserId",
  });
  RewardRedemption.belongsTo(User, {
    as: "cancelledBy",
    foreignKey: "cancelledByUserId",
  });

  // Redemption context -> Business (branch)
  RewardRedemption.belongsTo(Business, {
    as: "branch",
    foreignKey: "branchId",
  });

  // Link points transactions to redemptions (history + audit)
  RewardRedemption.hasMany(PointsTransaction, {
    as: "pointsTransactions",
    foreignKey: "relatedRedemptionId",
  });
  PointsTransaction.belongsTo(RewardRedemption, {
    as: "redemption",
    foreignKey: "relatedRedemptionId",
  });

  Object.assign(module.exports, sequelize.models);

  return sequelize.models;
}

module.exports = { registerModels };
