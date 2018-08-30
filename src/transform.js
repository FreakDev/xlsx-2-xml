
const readXlsxFile = require('read-excel-file/node')
const xmlbuilder = require('xmlbuilder');
const fs = require('fs');

const schemaHeader = {
    MsgId: {
        prop: 'MsgId',
        type: String
    },
    CreDtTm: {
        prop: 'CreDtTm',
        type: String
    },
    NbOfTxs: {
        prop: 'NbOfTxs',
        type: Number
    },
    CtrlSum: {
        prop: 'CtrlSum',
        type: Number
    },
    InitgPty: {
        prop: 'InitgPty',
        type: {
            'InitgPty|Nm': {
                prop: 'Nm',
                type: String
            }
        }
    }     
}

const schemaPmt = {
    PmtInfId: {
        prop: 'PmtInfId',
        type: String
    },
    PmtMtd: {
        prop: 'PmtMtd',
        type: String
    },
    BtchBookg: {
        prop: 'BtchBookg',
        type: Boolean
    },
    NbOfTxs: {
        prop: 'NbOfTxs',
        type: Number
    },
    CtrlSum: {
        prop: 'CtrlSum',
        type: Number
    },
    PmtTpInf: {
        prop: 'PmtTpInf',
        type: {
            SvcLvl: {
                prop: 'SvcLvl',
                type: {
                    'PmtTpInf|SvcLvl|Cd': {
                        prop: 'Cd',
                        type: String
                    }
                }
            }
        }
    },
    ReqdExctnDt: {
        prop: 'ReqdExctnDt',
        type: Date,
        dateFormat: 'YYYY-MM-DD'
    },
    Dbtr: {
        prop: 'Dbtr',
        type: {
            'Dbtr|Nm': {
                prop: 'Nm',
                type: String
            }
        }
    },
    DbtrAcct: {
        prop: 'DbtrAcct',
        type: {
            Id: {
                prop: 'Id',
                type: {
                    'DbtrAcct|Id|IBAN': {
                        prop: 'IBAN',
                        type: String
                    }
                }
            }
        }
    },
    DbtrAgt: {
        prop: 'DbtrAgt',
        type: {
            FinInstnId: {
                prop: 'FinInstnId',
                type: {
                    'DbtrAgt|FinInstnId|BIC': {
                        prop: 'BIC',
                        type: String
                    }
                }
            }
        }
    },
    ChrgBr: {
        prop: 'ChrgBr',
        type: String
    }
}

const schemaTransferts = {
    PmtId: {
        prop: 'PmtId',
        type: {
            'PmtId|InstrId': {
                prop: 'InstrId',
                type: String
            },
            'PmtId|EndToEndId': {
                prop: 'EndToEndId',
                type: String
            }
        }
    },
    Amt: {
        prop: 'Amt',
        type: {
            'InstdAmt': {
                prop: 'InstdAmt',
                type: {
                    'Amt|InstdAmt': {
                        prop: '#text',
                        type: String
                    },
                    'Amt|InstdAmt@Ccy': {
                        prop: '@Ccy',
                        type: String
                    }        
                }
            },
        }
    },
    Cdtr: {
        prop: 'Cdtr',
        type: {
            'Cdtr|Nm': {
                prop: 'Nm',
                type: String
            }
        }
    },
    CdtrAcct: {
        prop: 'CdtrAcct',
        type: {
            Id: {
                prop: 'Id',
                type: {
                    'CdtrAcct|Id|IBAN': {
                        prop: 'IBAN',
                        type: String
                    }
                }
            }
        }
    },
    RgltryRptg: {
        prop: 'RgltryRptg',
        type: {
            Dtls: {
                prop: 'Dtls',
                type: {
                    'RgltryRptg|Dtls|Cd': {
                        prop: 'Cd',
                        type: String
                    }
                }
            }
        }
    },
    RmtInf: {
        prop: 'RmtInf',
        type: {
            'RmtInf|Ustrd': {
                prop: 'Ustrd',
                type: String
            }
        }
    }
}

const transform = function (file) {
    // const file = process.argv[2]

    var headerLines, pmtLines, txLines,
    headerProm, pmtProm, txProm

    console.log('** reading file : ' + file + ' **')

    // parse Header
    headerProm = readXlsxFile(file, { schema: schemaHeader }).then(({ rows, errors}) => {
    if (!errors || errors.length === 0) {
        headerLines = rows
    } else {
        throw errors
    }
    }).catch( (e) => {
        console.log(e)
        console.log('headers error')
    })

    // parse Lines
    pmtProm = readXlsxFile(file, { schema: schemaPmt }).then(({ rows, errors }) => {
    if (errors.length === 0) {
        pmtLines = rows       
    } else {
        throw errors
    }
    }).catch( (e) => {
        console.log(e)
        console.log('pmt error')
    })

    // parse Lines
    txProm = readXlsxFile(file, { schema: schemaTransferts }).then(({ rows, errors }) => {
    if (errors.length === 0) {
        txLines = rows        
    } else {
        throw errors
    }
    }).catch( (e) => {
        console.log(e)
        console.log('transferts error')
    })

    return Promise.all([headerProm, pmtProm, txProm]).then( () => {

        var d = new Date(pmtLines[0].ReqdExctnDt)

        pmtLines[0].ReqdExctnDt = d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0')

        var xml = xmlbuilder.create({
            Document: {
                '@xmlns': 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.03',
                CstmrCdtTrfInitn: {
                    GrpHdr: headerLines[0],
                    PmtInf: {
                        ...pmtLines[0],
                        CdtTrfTxInf: txLines
                    }
                }
            }
        }, { encoding: 'utf-8', standalone: false })

        console.log('** job done **')

        return xml.end()
    })
}

module.exports = transform
