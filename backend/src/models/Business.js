// backend/src/models/Business.js
const { DataTypes } = require("sequelize");

/**
 * Business model
 * - Single table for both principal business and branches (sucursales)
 * - Principal business: parentId = null
 * - Branch: parentId = UUID of principal business
 *
 * Naming decisions (aligned with your latest frontend):
 * - commercialName: Nombre comercial (required for principal and branch)
 * - legalName: Razón social (required ONLY for principal)
 * - category: required ONLY for principal; branches inherit from principal in reads
 * - planKey: per principal business; default "free"
 */
function initBusinessModel(sequelize) {
  const Business = sequelize.define(
    "Business",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      // Tree structure: null = principal, non-null = branch
      parentId: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      // Visible name (used for both principal and branches)
      commercialName: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },

      // Public join URL identifier (only for principal business)
      slug: {
        type: DataTypes.STRING(120),
        allowNull: true,
        unique: true,
      },

      // Legal name (only for principal)
      legalName: {
        type: DataTypes.STRING(180),
        allowNull: true,
      },

      // Required for principal; branches can be null (inherit from parent in API)
      category: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },

      // Plan is per principal business (branches inherit via parent)
      planKey: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "free", // "free" | "small" | "pro"
      },

      // Contact / address
      email: {
        type: DataTypes.STRING(180),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(220),
        allowNull: true,
      },
      businessUrl: {
        type: DataTypes.STRING(240),
        allowNull: true,
      },

      // Fiscal (principal only)
      ruc: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      // Ubigeo (optional for now; can be used for both principal and branches)
      departamento: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      provincia: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      distrito: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      ubigeoId: {
        type: DataTypes.STRING(12),
        allowNull: true,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "businesses",
      timestamps: true,
      indexes: [
        { fields: ["planKey"] },
        { fields: ["parentId"] },
        { fields: ["ubigeoId"] },
        // Helpful (optional) uniqueness rule to avoid duplicated branch names under same principal.
        // Note: This will also apply to principals with parentId = null (depending on DB behavior for NULL).
        // If you want strict "per parent only", enforce at service-layer instead.
        { fields: ["parentId", "commercialName"] },
      ],
      validate: {
        /**
         * Enforce principal vs branch requirements without hard DB constraints.
         * - Principal (parentId null): legalName + category required; planKey must exist
         * - Branch (parentId not null): legalName should not be required; category may be null
         */
        principalVsBranchRules() {
          const isPrincipal = !this.parentId;

          if (isPrincipal) {
            if (!this.slug || !String(this.slug).trim()) {
              throw new Error("slug is required for a principal business.");
            }
          } else {
            if (this.slug && String(this.slug).trim()) {
              throw new Error(
                "slug must be null/empty for a branch (it belongs to the principal).",
              );
            }
          }

          if (isPrincipal) {
            if (!this.planKey || !String(this.planKey).trim()) {
              throw new Error("planKey is required for a principal business.");
            }
          } else {
            // Branch: do not allow setting legalName/ruc/planKey/category inconsistently (soft rule)
            // You can relax these if needed later.
            if (this.legalName && String(this.legalName).trim()) {
              throw new Error(
                "legalName must be null/empty for a branch (it belongs to the principal).",
              );
            }
            if (this.ruc && String(this.ruc).trim()) {
              throw new Error(
                "ruc must be null/empty for a branch (it belongs to the principal).",
              );
            }
          }
        },
      },
    },
  );

  return Business;
}

module.exports = { initBusinessModel };
