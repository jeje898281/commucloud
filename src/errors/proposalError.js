// proposalError.js
const BaseError = require('./BaseError');

class ProposalNotFoundError extends BaseError {
    constructor() { super('Proposal not found', 'PROPOSAL_NOT_FOUND', 404); }
}

class ProposalTitleInvalidError extends BaseError {
    constructor() { super('Proposal title is invalid', 'PROPOSAL_TITLE_INVALID', 400); }
}

class ProposalContentInvalidError extends BaseError {
    constructor() { super('Proposal content is invalid', 'PROPOSAL_CONTENT_INVALID', 400); }
}

class ProposalSqmThresholdInvalidError extends BaseError {
    constructor() { super('Proposal sqm threshold is invalid', 'PROPOSAL_SQM_THRESHOLD_INVALID', 400); }
}

class ProposalResidentThresholdInvalidError extends BaseError {
    constructor() { super('Proposal resident threshold is invalid', 'PROPOSAL_RESIDENT_THRESHOLD_INVALID', 400); }
}

class AlreadyVotedError extends BaseError {
    constructor() { super('This resident has already voted on this proposal', 'ALREADY_VOTED', 409); }
}

class VoteResultInvalidError extends BaseError {
    constructor() { super('Vote result is invalid', 'VOTE_RESULT_INVALID', 400); }
}

module.exports = {
    ProposalNotFoundError,
    ProposalTitleInvalidError,
    ProposalContentInvalidError,
    ProposalSqmThresholdInvalidError,
    ProposalResidentThresholdInvalidError,
    AlreadyVotedError,
    VoteResultInvalidError,
};
