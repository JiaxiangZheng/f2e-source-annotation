
```
array: createPrimitiveTypeChecker('array'),
bool: createPrimitiveTypeChecker('boolean'),
func: createPrimitiveTypeChecker('function'),
number: createPrimitiveTypeChecker('number'),
object: createPrimitiveTypeChecker('object'),
string: createPrimitiveTypeChecker('string'),

any: createAnyTypeChecker(),
arrayOf: createArrayOfTypeChecker,
element: createElementTypeChecker(),
instanceOf: createInstanceTypeChecker,
node: createNodeChecker(),
objectOf: createObjectOfTypeChecker,
oneOf: createEnumTypeChecker,
oneOfType: createUnionTypeChecker,
shape: createShapeTypeChecker
```