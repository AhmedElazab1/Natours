// This catchAsync takes a function (fn) as a parameter then returns a function with parameters (res, req, next);
// This returned function excecutes fn and returns a promise with catch(next)
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
