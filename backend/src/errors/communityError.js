const BaseError = require('./BaseError');

class CommunityNotFoundError extends BaseError {
    constructor() { super('Community not found', 'COMMUNITY_NOT_FOUND', 404); }
}

class CommunityNameEmptyError extends BaseError {
    constructor() { super('Community name is empty', 'COMMUNITY_NAME_EMPTY', 400); }
}

class CommunityNameTooLongError extends BaseError {
    constructor() { super('Community name is too long', 'COMMUNITY_NAME_TOO_LONG', 400); }
}

class CommunityDescriptionEmptyError extends BaseError {
    constructor() { super('Community description is empty', 'COMMUNITY_DESCRIPTION_EMPTY', 400); }
}

class CommunityDescriptionTooLongError extends BaseError {
    constructor() { super('Community description is too long', 'COMMUNITY_DESCRIPTION_TOO_LONG', 400); }
}

class CommunityLogoUrlEmptyError extends BaseError {
    constructor() { super('Community logo URL is empty', 'COMMUNITY_LOGO_URL_EMPTY', 400); }
}

class CommunityLogoUrlTooLongError extends BaseError {
    constructor() { super('Community logo URL is too long', 'COMMUNITY_LOGO_URL_TOO_LONG', 400); }
}

class NoUpdateFieldsError extends BaseError {
    constructor() { super('No update fields', 'NO_UPDATE_FIELDS', 400); }
}

module.exports = {
    CommunityNotFoundError, CommunityNameEmptyError, CommunityNameTooLongError,
    CommunityDescriptionEmptyError, CommunityDescriptionTooLongError, CommunityLogoUrlEmptyError,
    CommunityLogoUrlTooLongError, NoUpdateFieldsError
};