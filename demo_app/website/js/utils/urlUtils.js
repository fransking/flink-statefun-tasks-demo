export const getBaseUrl = (protocol='http') =>  {
    const secure = window.location.protocol == 'http:' ? '' : 's'
    const port = window.location.port === '3000' ? '8082': window.location.port
    return protocol + secure + '://' + window.location.hostname + ':' + port
}
