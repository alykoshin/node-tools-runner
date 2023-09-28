"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
exports.actions = void 0;
const util_1 = require("../../lib/util");
exports.actions = {
    error: async function error(action, params, { evaluate, logger }) {
        (0, util_1.fn_check_params)(params, { exactCount: 1 });
        const pValue = await evaluate(params[0]);
        const sValue = String(pValue);
        logger.fatal(sValue);
    },
    /**
     *
     * https://www.cs.cmu.edu/Groups/AI/html/cltl/clm/node336.html
     *
     */
    assert: async function (action, params, { evaluate, scopes, logger }) {
        (0, util_1.fn_check_params)(params, { minCount: 1 });
        const pActual = await evaluate(params[0]);
        // console.log('>>>', actual)
        const bActual = !!pActual;
        const sActual = JSON.stringify(pActual);
        if (!bActual) {
            const printParams = params.slice(1);
            ``;
            const msgs = await Promise.all(printParams.map(async (p) => await evaluate(['print', p])));
            // }
            let msg1 = [`Assert failed:`, sActual];
            // msg += params[1] ? (msg = String(await evaluate(params[1]))) : sActual;
            // msg += msgs.length > 0 ?  : sActual;
            logger.fatal(...msg1, ...msgs);
        }
        return bActual;
    },
};
exports.default = exports.actions;
//# sourceMappingURL=error.js.map