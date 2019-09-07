import React from 'react'
import Button from '@material-ui/core/Button'

export default ({ handleBack, handleNext, canAdvance }) => <div>
  {
    (typeof handleBack == 'function') && (
    <Button onClick={handleBack} variant="outlined" color="secondary">
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
