import React from 'react'
import Button from '@material-ui/core/Button'

export default ({ handleBack, handleNext, canAdvance }) => <div>
  {
    (typeof handleBack == 'function') && (
    <Button onClick={handleBack}>
      Back
    </Button>
  )
  }
  {
    (typeof handleNext == 'function') && (
      <Button
        disabled={!canAdvance}
        variant="contained"
        color="primary"
        onClick={handleNext}
      >
        Continue
      </Button>
    )
  }
</div>
