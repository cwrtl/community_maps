/**
 * @param {Object} [prefix]
 * @param {String} method
 * @param {Function} patch
 */
function autociv_patchApplyN()
{
    let prefix, method, patch;
    if (arguments.length < 2)
    {
        let error = new Error("Insufficient arguments to patch: " + method);
        warn(error.message)
        warn(error.stack)
    }
    if (arguments.length == 2)
    {
        prefix = global;
        method = arguments[0];
        patch = arguments[1];
    }
    else
    {
        prefix = arguments[0];
        method = arguments[1];
        patch = arguments[2];
    }

    if (!(method in prefix))
    {
        let error = new Error("Function not defined: " + method);
        warn(error.message)
        warn(error.stack)
        return;
    }

    prefix[method] = new Proxy(prefix[method], { apply: patch });
}
