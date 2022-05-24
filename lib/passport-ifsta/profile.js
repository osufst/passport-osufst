/**
 * Parse profile.
 *
 * @param {Object|String} json
 * @return {Object}
 * @api private
 */
exports.parse = function (json) {
    if ('string' == typeof json) {
        json = JSON.parse(json);
    }
    let profile = {};
    profile.id = json.id;
    profile.displayName = json.displayName;
    profile.preferredUsername = json.preferredUsername;
    profile.name = json.name;
    profile.emails = json.emails;
    profile.groups = json.groups;
    profile.photos = json.photos;
    profile.organizations = json.organizations;
    return profile;
};
