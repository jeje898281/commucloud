const { MeetingNotFoundError } = require('./meetingError');
const { UnauthorizedError, TokenNotFoundError } = require('./authErrors');
const {
    UserNotFoundError, DisplayNameEmptyError, DisplayNameTooLongError,
    MissingRequiredFieldsError,
    UsernameTakenError, EmailTakenError, CannotModifySelfError,
    LastAdminProtectedError, RoleInvalidError, TargetUserNotInCommunityError
} = require('./userError');

const { CommunityNotFoundError, CommunityNameEmptyError,
    CommunityNameTooLongError, CommunityDescriptionEmptyError,
    CommunityDescriptionTooLongError, CommunityLogoUrlEmptyError,
    CommunityLogoUrlTooLongError, NoUpdateFieldsError
} = require('./communityError');

const { AlreadyCheckedInError, MeetingIdInvalidError, MeetingSqmThresholdInvalidError,
    MeetingResidentThresholdInvalidError, MeetingDateInvalidError, MeetingStatusInvalidError,
    QRCodeInvalidError
} = require('./meetingError');

const { WrongPasswordError, PasswordTooShortError,
    PasswordTooLongError, PasswordInvalidFormatError, PasswordSameAsCurrentError,
    AccountDeactivatedError, ForbiddenError
} = require('./authErrors');

const { ResidentCodeAlreadyExistsError, ResidentNotFoundError, ResidentHasCheckinDataError } = require('./residentError');

const { BadRequestError } = require('./commonError');

const BaseError = require('./BaseError');

module.exports = {
    BaseError,
    MeetingNotFoundError,
    UnauthorizedError,
    TokenNotFoundError,
    UserNotFoundError,
    DisplayNameEmptyError,
    DisplayNameTooLongError,
    NoUpdateFieldsError,
    CommunityNotFoundError,
    CommunityNameEmptyError,
    CommunityNameTooLongError,
    CommunityDescriptionEmptyError,
    CommunityDescriptionTooLongError,
    CommunityLogoUrlEmptyError,
    CommunityLogoUrlTooLongError,
    AlreadyCheckedInError,
    MeetingIdInvalidError,
    MeetingSqmThresholdInvalidError,
    MeetingResidentThresholdInvalidError,
    MeetingDateInvalidError,
    MeetingStatusInvalidError,
    WrongPasswordError,
    MissingRequiredFieldsError,
    PasswordTooShortError,
    PasswordTooLongError,
    PasswordInvalidFormatError,
    PasswordSameAsCurrentError,
    ResidentCodeAlreadyExistsError,
    ResidentNotFoundError,
    ResidentHasCheckinDataError,
    BadRequestError,
    UsernameTakenError,
    EmailTakenError,
    CannotModifySelfError,
    LastAdminProtectedError,
    RoleInvalidError,
    TargetUserNotInCommunityError,
    AccountDeactivatedError,
    ForbiddenError,
    QRCodeInvalidError
};