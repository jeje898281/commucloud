const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function loadSwaggerSpec() {
    // 載入主檔
    const indexSpec = yaml.load(fs.readFileSync(path.join(__dirname, '../../docs/openapi/index.yaml'), 'utf8'));

    // 合併 paths
    const checkinSpec = yaml.load(fs.readFileSync(path.join(__dirname, '../../docs/openapi/paths/checkin.yaml'), 'utf8'));
    indexSpec.paths = {
        ...indexSpec.paths,
        '/api/report/checkin': checkinSpec.paths['/api/report/checkin'],
    };
    const summarySpec = yaml.load(fs.readFileSync(path.join(__dirname, '../../docs/openapi/paths/summary.yaml'), 'utf8'));
    indexSpec.paths = {
        ...indexSpec.paths,
        '/api/meeting/attendance-summary/{meetingId}': summarySpec.paths['/api/meeting/attendance-summary/{meetingId}'],
    };

    // 合併 components
    const schemasComp = yaml.load(fs.readFileSync(path.join(__dirname, '../../docs/openapi/components/schemas.yaml'), 'utf8')).components.schemas;
    const securityComp = yaml.load(fs.readFileSync(path.join(__dirname, '../../docs/openapi/components/security.yaml'), 'utf8')).components.securitySchemes;

    indexSpec.components = indexSpec.components || {};
    indexSpec.components.schemas = schemasComp;
    indexSpec.components.securitySchemes = securityComp;

    return indexSpec;
}

module.exports = loadSwaggerSpec;
