from rest_framework.renderers import JSONRenderer

class SyncNoteJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        status_code = renderer_context['response'].status_code if renderer_context else 200
        
        response = {
            'success': True,
            'data': data,
            'message': None
        }

        if status_code >= 400:
            response['success'] = False
            response['data'] = None
            response['message'] = "An error occurred"
            response['error_code'] = "ERROR"
            
            if isinstance(data, dict):
                if 'detail' in data:
                    response['message'] = data['detail']
                
                # Try to extract error code/message from validation errors
                keys = list(data.keys())
                if keys and keys[0] != 'detail':
                    error_field = keys[0]
                    response['error_code'] = error_field.upper()
                    
                    error_content = data[error_field]
                    if isinstance(error_content, list) and len(error_content) > 0:
                        response['message'] = str(error_content[0])
                    else:
                        response['message'] = str(error_content)
            elif isinstance(data, list) and len(data) > 0:
                 response['message'] = str(data[0])

        return super().render(response, accepted_media_type, renderer_context)
