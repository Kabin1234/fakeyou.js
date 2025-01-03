const Util = require('../util/Util');
const User = require('./User');

class Category {
  constructor(client, data) {
    this.client = client;
    this.token = data.category_token;
    this.type = data.model_type;
    this.title = data.name;
    this.name = data.maybe_dropdown_name ?? data.name_for_dropdown;
    this.superCategoryToken = data.maybe_super_category_token;
    this.userToken = data.creator_user_token ?? null;
    this.user = this.userToken
      ? new User(this.client, Util.userPartialData(data))
      : null;
    this.createdAt = data.created_at ? new Date(data.created_at) : null;
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : null;
    this.features = {
      canHaveModels: data.can_directly_have_models,
      canHaveSubcategories: data.can_have_subcategories,
      canOnlyMods: data.can_only_mods_apply
    };
  }

  get partial() {
    return !this.user;
  }
  get superCategory() {
    return this.superCategoryToken
      ? this.client.categories.cache.get(this.superCategoryToken)
      : null;
  }
  get subCategories() {
    return this.client.categories.cache.filter(
      (c) => c.superCategoryToken == this.token
    );
  }
  get models() {
    return this.client.models.cache.filter((m) =>
      m.categoryTokens.find((t) => t == this.token)
    );
  }
  get createdTimestamp() {
    return this.createdAt ? Math.floor(this.createdAt.getTime() / 1000) : null;
  }
  get updatedTimestamp() {
    return this.updatedAt ? Math.floor(this.updatedAt.getTime() / 1000) : null;
  }

  isSuperCategory() {
    return Boolean(
      !this.features.canHaveModels && this.features.canHaveSubcategories
    );
  }
  isSubCategory() {
    return Boolean(
      this.superCategoryToken &&
        this.features.canHaveModels &&
        this.features.canHaveSubcategories
    );
  }

  async fetch() {
    return await this.client.categories.fetch(this.token);
  }
}

module.exports = Category;
