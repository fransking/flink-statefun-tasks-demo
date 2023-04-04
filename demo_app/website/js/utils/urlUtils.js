export const getBaseUrl = (protocol='http') =>  {
    const port = window.location.port === '3000' ? '8082': window.location.port
    return protocol + '://' + window.location.hostname + ':' + port
}
