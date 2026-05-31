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
    AccountDeactivatedError, ForbiddenError, DemoLoginDisabledError
} = require('./authErrors');

const { ResidentCodeAlreadyExistsError, ResidentNotFoundError, ResidentHasCheckinDataError } = require('./residentError');

const { BadRequestError } = require('./commonError');

const {
    ProposalNotFoundError, ProposalTitleInvalidError, ProposalContentInvalidError,
    ProposalSqmThresholdInvalidError, ProposalResidentThresholdInvalidError,
    AlreadyVotedError, VoteResultInvalidError
} = require('./proposalError');

const BaseError = require('./BaseError');

module.exports = {
    BaseError,
    ProposalNotFoundError,
    ProposalTitleInvalidError,
    ProposalContentInvalidError,
    ProposalSqmThresholdInvalidError,
    ProposalResidentThresholdInvalidError,
    AlreadyVotedError,
    VoteResultInvalidError,
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
    DemoLoginDisabledError,
    QRCodeInvalidError
};