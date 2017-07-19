/**
 * @class ObjectPropertyLocator
 * @author Arturo Saavedra (arthmoeros)
 * 
 * This locator is used to determine a property value within an object
 */
export class ObjectPropertyLocator {

    /**
     * Looks up a value within a object given a path
     * 
     * @param object object to inspect
     * @param path Path to lookup in the object must follow the format root.parent.children
     * @throws an Error if the path points to a member of an array
     */
    public static lookup(object: {}, path: string): any {
        let nesting: string[] = path.split(".");
        let resolvedValue: any = null;
        let nextChild: any = object;
        if(nextChild == null){
            throw new Error("Root object is null");
        }
        for(let i = 0; i < nesting.length; i++){
            nextChild = nextChild[nesting[i]];
            if (nextChild == null) {
                resolvedValue = null;
                break;
            }else{
                if((i+1) < nesting.length && Array.isArray(nextChild)){
                    throw new Error(`Path points to an array's child: ${path} at ${nesting[i+1]}`);
                }
                if((i+1) == nesting.length){
                    resolvedValue = nextChild;
                }
            }
        }
        return resolvedValue;
    }

}